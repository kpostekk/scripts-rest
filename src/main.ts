import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const swConfig = new DocumentBuilder()
    .setTitle('whatever')
    .setDescription('Whatever API')
    .build()

  const swDocument = SwaggerModule.createDocument(app, swConfig)
  SwaggerModule.setup('', app, swDocument)

  await app.listen(3000)
}
bootstrap()
