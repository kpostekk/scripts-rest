import { NotFoundException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Scripts } from '../scripts/scripts.entity'
import { FindConditions, Repository } from 'typeorm'
import { ChildProcess, spawn } from 'child_process'
import { createHash, randomBytes } from 'crypto'
import { homedir } from 'os'
import { RunResult } from './entities/run.entity'
import { RunLog } from './entities/log.entity'
import { writeFile, rm } from 'fs/promises'

@Injectable()
export class RunnersService {
  private readonly logger = new Logger(RunnersService.name)
  private processes: Map<string, ChildProcess> = new Map()
  private runsToScripts: Map<string, Scripts> = new Map()

  constructor(
    @InjectRepository(Scripts)
    private scriptRepository: Repository<Scripts>,
    @InjectRepository(RunResult)
    private runResultRepository: Repository<RunResult>,
    @InjectRepository(RunLog)
    private runLogRepository: Repository<RunLog>,
  ) {}

  private async repackScriptToFile(
    script: Scripts,
    runId: string,
    cwd: string,
  ): Promise<string> {
    const scriptFilename = `${cwd}/.tmp-runner-${runId}.sh`
    await writeFile(scriptFilename, script.command)
    return scriptFilename
  }

  private async cleanAfterRun(runId: string, cwd: string) {
    const scriptFilename = `${cwd}/.tmp-runner-${runId}.sh`
    await rm(scriptFilename)
    this.processes.delete(runId)
    this.runsToScripts.delete(runId)
  }

  async execScript(
    where: FindConditions<Scripts> | Array<FindConditions<Scripts>>,
    envExtension: Record<string, string> = {},
  ) {
    // Find script schema
    const script = await this.scriptRepository.findOne({ where })

    if (script === undefined) throw new NotFoundException()

    // Create runId for identification purposes
    const runId: string = createHash('sha256')
      .update(script.command)
      .update(script.id.toString())
      .update(randomBytes(16))
      .digest('hex')
      .slice(0, 24)

    // Replace ~ with homedir
    const cwd = script.workingDir.replace('~', homedir())

    // Pack script into file
    const scriptName = await this.repackScriptToFile(script, runId, cwd)

    // Spawn script and register it
    await this.runLogRepository.save({
      runId,
      script,
      status: 'Started',
    })

    const spawnedProcess = spawn('bash', [scriptName], {
      cwd,
      env: {
        ...process.env,
        ...envExtension,
      },
    })

    const stdoutPassToDB = async (chunk: any) => {
      await this.runResultRepository.save({
        runId,
        script,
        text: chunk.toString(),
      })
    }

    // Pass stdout to DB
    spawnedProcess.stdout.on('data', stdoutPassToDB)
    spawnedProcess.stderr.on('data', stdoutPassToDB)

    spawnedProcess.on('error', async (err) => {
      this.logger.warn(
        `Run of script ${script.alias ?? script.command} failed!`,
        err,
      )
      await this.cleanAfterRun(runId, cwd)
      await this.runLogRepository.save({
        script,
        runId,
        status: 'Errored',
      })
    })

    spawnedProcess.on('exit', async (code) => {
      this.logger.log(
        `${runId.slice(0, 8)}... finished its ${
          script.alias ?? 'scriptId' + script.id
        } job with code ${code}.`,
      )
      await this.cleanAfterRun(runId, cwd)
      await this.runLogRepository.save({
        script,
        runId,
        status: 'Finished',
      })
    })
    spawnedProcess.stdout.pipe(process.stdout)
    spawnedProcess.stderr.pipe(process.stderr)

    this.processes.set(runId, spawnedProcess)
    this.runsToScripts.set(runId, script)

    // Return runId for identification
    return { runId }
  }

  async killProcess(runId: string) {
    if (!this.processes.has(runId)) throw new NotFoundException()
    const proc = this.processes.get(runId)
    this.processes.delete(runId)
    const script = this.runsToScripts.get(runId)
    this.runsToScripts.delete(runId)
    proc.kill('SIGABRT')
    await this.runLogRepository.save({
      runId,
      status: 'Killed',
      script,
    })
    return { script }
  }

  async statusOfSpecifiedRun(runId: string) {
    const runStatuses = await this.runLogRepository.find({
      where: { runId },
      order: { runDate: 'DESC' },
      relations: ['script'],
    })

    if (runStatuses.length < 1) throw new NotFoundException()

    const runResults = await this.runResultRepository.find({
      where: { runId },
    })
    const stdoutStrings = runResults.map((rr) => rr.text)
    return {
      status: runStatuses[0].status,
      runStatuses: runStatuses.map((rs) => ({
        status: rs.status,
        when: new Date(rs.runDate).toISOString(),
      })),
      stdoutStrings,
      script: runStatuses[0].script,
    }
  }
}
