import { Test, TestingModule } from '@nestjs/testing';
import { RunnersController } from './runners.controller';

describe('RunnersController', () => {
  let controller: RunnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunnersController],
    }).compile();

    controller = module.get<RunnersController>(RunnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
