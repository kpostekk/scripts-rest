import { Controller } from '@nestjs/common'
import { Crud, CrudController } from '@nestjsx/crud'
import { Script } from './scripts.entity'
import { ScriptsService } from './scripts.service'

@Crud({
  model: {
    type: Script,
  },
})
@Controller('scripts')
export class ScriptsController implements CrudController<Script> {
  constructor(public service: ScriptsService) {}
}
