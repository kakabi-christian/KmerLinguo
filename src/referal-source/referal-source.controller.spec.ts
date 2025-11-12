import { Test, TestingModule } from '@nestjs/testing';
import { ReferalSourceController } from './referal-source.controller';

describe('ReferalSourceController', () => {
  let controller: ReferalSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferalSourceController],
    }).compile();

    controller = module.get<ReferalSourceController>(ReferalSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
