import { Controller } from '@nestjs/common'
import { Crud, CrudController } from '@nestjsx/crud'
import { Scripts } from './scripts.entity'
import { ScriptsService } from './scripts.service'

@Crud({
  model: {
    type: Scripts,
  },
})
@Controller('scripts')
export class ScriptsController implements CrudController<Scripts> {
  constructor(public service: ScriptsService) {}
}
