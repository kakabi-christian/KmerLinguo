import { Test, TestingModule } from '@nestjs/testing';
import { ProgressionService } from './progression.service';

describe('ProgressionService', () => {
  let service: ProgressionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgressionService],
    }).compile();

    service = module.get<ProgressionService>(ProgressionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
