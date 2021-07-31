import { Controller, Delete, Get, Param } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { RunnersService } from './runners.service'

@Controller('run')
export class RunnersController {
  constructor(private runnersService: RunnersService) {}

  @Get('id/:id')
  async execScriptByID(@Param('id') id: number) {
    return await this.runnersService.execScript({ id })
  }

  @Get('alias/:alias')
  async execScriptByAlias(@Param('alias') alias: string) {
    return await this.runnersService.execScript({ alias })
  }

  @ApiProperty({ example: '8af37b30bf3d965a2bd95dce' })
  @Get('status/:runId')
  async statusOfSpecifiedRun(@Param('runId') runId: string) {
    return await this.runnersService.statusOfSpecifiedRun(runId)
  }

  @Delete('kill/:runId')
  async killRun(@Param('runId') runId: string) {
    const { script } = await this.runnersService.killProcess(runId)
    return { removed: true, runId, script }
  }
}
