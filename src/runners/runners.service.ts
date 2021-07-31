import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Scripts } from '../scripts/scripts.entity'
import { FindConditions, Repository } from 'typeorm'
import { ChildProcess, spawn } from 'child_process'
import { createHash, randomBytes } from 'crypto'
import { homedir } from 'os'
import { RunResult } from './entities/run.entity'
import { RunLog } from './entities/log.entity'

@Injectable()
export class RunnersService {
  private readonly logger = new Logger(RunnersService.name)

  constructor(
    @InjectRepository(Scripts)
    private scriptRepository: Repository<Scripts>,
    @InjectRepository(RunResult)
    private runResultRepository: Repository<RunResult>,
    @InjectRepository(RunLog)
    private runLogRepository: Repository<RunLog>,
  ) {}

  async execScript(
    where: FindConditions<Scripts> | Array<FindConditions<Scripts>>,
  ) {
    // Find script schema
    const script = await this.scriptRepository.findOne({ where })

    // Create runId for identification purposes
    const runId: string = createHash('sha256')
      .update(script.command)
      .update(script.id.toString())
      .update(randomBytes(16))
      .digest('hex')
      .slice(0, 24)

    // Replace ~ with homedir
    const cwd = script.workingDir.replace('~', homedir())

    // Spawn script and register it
    const fragments = script.command.split(' ')
    await this.runLogRepository.save({
      runId,
      script,
      status: 'Started',
    })
    const s = spawn(fragments[0], fragments.slice(1), { cwd })

    // Pass stdout to DB
    s.stdout.on('data', async (chunk) => {
      await this.runResultRepository.save({
        runId,
        script,
        text: chunk.toString(),
      })
    })

    s.on('error', async (err) => {
      this.logger.warn(
        `Run of script ${script.alias ?? script.command} failed!`,
        err,
      )
      await this.runLogRepository.save({
        script,
        runId,
        status: 'Errored',
      })
    })

    s.on('exit', async (code) => {
      this.logger.log(
        `${runId.slice(0, 8)}... finished its ${
          script.alias ?? 'scriptId' + script.id
        } job with code ${code}.`,
      )
      await this.runLogRepository.save({
        script,
        runId,
        status: 'Finished',
      })
    })
    s.stdout.pipe(process.stdout)

    // Return runId for identification
    return { runId }
  }

  async statusOfSpecifiedRun(runId: string) {
    const runStatuses = await this.runLogRepository.find({
      where: { runId },
      order: { runDate: 'DESC' },
      relations: ['script'],
    })
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
