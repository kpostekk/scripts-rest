import { Test, TestingModule } from '@nestjs/testing';
import { RunnersService } from './runners.service';

describe('RunnersService', () => {
  let service: RunnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunnersService],
    }).compile();

    service = module.get<RunnersService>(RunnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
