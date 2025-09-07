import { Test, TestingModule } from '@nestjs/testing';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('lowcodeController', () => {
  let controller: LowcodeController;
  let service: LowcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [lowcodeController],
      providers: [
        {
          provide: lowcodeService,
          useValue: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LowcodeController>(LowcodeController);
    service = module.get<LowcodeService>(LowcodeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof controller).toBe('object');
  });
});
