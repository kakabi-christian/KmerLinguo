import { Test, TestingModule } from '@nestjs/testing';
import { ProgressionQuestionService } from './progression-question.service';

describe('ProgressionQuestionService', () => {
  let service: ProgressionQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgressionQuestionService],
    }).compile();

    service = module.get<ProgressionQuestionService>(ProgressionQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
