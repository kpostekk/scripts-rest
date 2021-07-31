import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const swConfig = new DocumentBuilder()
    .setTitle('whatever')
    .setDescription('Whatever API')
    .build()

  SwaggerModule.setup('', app, SwaggerModule.createDocument(app, swConfig))

  await app.listen(3000)
}
bootstrap()
