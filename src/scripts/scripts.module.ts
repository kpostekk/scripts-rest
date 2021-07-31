import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Scripts } from './scripts.entity'
import { ScriptsService } from './scripts.service'
import { ScriptsController } from './scripts.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Scripts])],
  providers: [ScriptsService],
  exports: [ScriptsService],
  controllers: [ScriptsController],
})
export class ScriptsModule {}
