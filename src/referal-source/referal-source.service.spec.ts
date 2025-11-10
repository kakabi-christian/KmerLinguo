import { Test, TestingModule } from '@nestjs/testing';
import { ReferalSourceService } from './referal-source.service';

describe('ReferalSourceService', () => {
  let service: ReferalSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferalSourceService],
    }).compile();

    service = module.get<ReferalSourceService>(ReferalSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
