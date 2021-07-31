import { Module } from '@nestjs/common'
import { RunnersController } from './runners.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Scripts } from '../scripts/scripts.entity'
import { RunnersService } from './runners.service'
import { RunResult } from './entities/run.entity'
import { RunLog } from './entities/log.entity'

@Module({
  controllers: [RunnersController],
  imports: [TypeOrmModule.forFeature([Scripts, RunResult, RunLog])],
  providers: [RunnersService],
})
export class RunnersModule {}
