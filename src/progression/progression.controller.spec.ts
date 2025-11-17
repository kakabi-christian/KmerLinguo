import { Test, TestingModule } from '@nestjs/testing';
import { ProgressionController } from './progression.controller';

describe('ProgressionController', () => {
  let controller: ProgressionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressionController],
    }).compile();

    controller = module.get<ProgressionController>(ProgressionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
