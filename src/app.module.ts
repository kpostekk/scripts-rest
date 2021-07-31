import { Module } from '@nestjs/common'
import { ScriptsModule } from './scripts/scripts.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Scripts } from './scripts/scripts.entity'
import { RunnersModule } from './runners/runners.module'
import { RunResult } from './runners/entities/run.entity'
import { RunLog } from './runners/entities/log.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'whocares.sqlite',
      entities: [Scripts, RunResult, RunLog],
      synchronize: true,
    }),
    ScriptsModule,
    RunnersModule,
  ],
})
export class AppModule {}
