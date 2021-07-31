import { Injectable } from '@nestjs/common'
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm'
import { Script } from './scripts.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class ScriptsService extends TypeOrmCrudService<Script> {
  constructor(@InjectRepository(Script) repo) {
    super(repo)
  }
}
