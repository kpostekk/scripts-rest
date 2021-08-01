import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common'
import { ApiOperation, ApiProperty } from '@nestjs/swagger'
import { RunnersService } from './runners.service'

class RunScriptRequest {
  @ApiProperty({ description: 'Find Script by id' })
  id?: number
  @ApiProperty({
    description: 'Find Script by alias',
    example: 'delayed-shutdown',
  })
  alias?: string
  @ApiProperty({
    description: 'Specify runtime env',
    example: { DELAY: 20 },
  })
  env?: Record<string, string>
}

@Controller('run')
export class RunnersController {
  constructor(private runnersService: RunnersService) {}

  @Post()
  @ApiOperation({ summary: 'Run specified Script' })
  async execScriptByAlias(@Body() runRequest: RunScriptRequest) {
    if (!!runRequest.alias && !!runRequest.id)
      throw new BadRequestException(
        undefined,
        "Don't pass id and alias. Pass only one of them!",
      )
    if (runRequest.alias)
      return await this.runnersService.execScript(
        { alias: runRequest.alias },
        runRequest.env,
      )
    if (runRequest.id)
      return await this.runnersService.execScript(
        { id: runRequest.id },
        runRequest.env,
      )
    throw new BadRequestException(undefined, 'Pass id or alias!')
  }

  @ApiOperation({ summary: "Returns Scripts' statuses" })
  @Get('status/:runId')
  async statusOfSpecifiedRun(@Param('runId') runId: string) {
    return await this.runnersService.statusOfSpecifiedRun(runId)
  }

  @ApiOperation({ summary: 'Kills specified runner' })
  @Delete('kill/:runId')
  async killRun(@Param('runId') runId: string) {
    const { script } = await this.runnersService.killProcess(runId)
    return { removed: true, runId, script }
  }
}
