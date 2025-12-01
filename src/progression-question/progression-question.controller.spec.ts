import { Test, TestingModule } from '@nestjs/testing';
import { ProgressionQuestionController } from './progression-question.controller';

describe('ProgressionQuestionController', () => {
  let controller: ProgressionQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressionQuestionController],
    }).compile();

    controller = module.get<ProgressionQuestionController>(ProgressionQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
