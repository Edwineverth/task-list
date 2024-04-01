import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionServiceImpl } from './subscription-service-impl.service';

describe('SubscriptionService', () => {
  let service: SubscriptionServiceImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionServiceImpl],
    }).compile();

    service = module.get<SubscriptionServiceImpl>(SubscriptionServiceImpl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
