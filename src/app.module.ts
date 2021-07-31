import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ScriptsModule } from './scripts/scripts.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Script } from './scripts/scripts.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'whocares',
      entities: [Script],
      synchronize: true,
    }),
    ScriptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
