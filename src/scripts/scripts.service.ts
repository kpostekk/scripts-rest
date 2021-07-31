import { Injectable } from '@nestjs/common'
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm'
import { Scripts } from './scripts.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class ScriptsService extends TypeOrmCrudService<Scripts> {
  constructor(@InjectRepository(Scripts) repo) {
    super(repo)
  }
}
