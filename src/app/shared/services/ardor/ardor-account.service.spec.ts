import { TestBed } from '@angular/core/testing';

import { ArdorAccountService } from './ardor-account.service';

describe('ArdorAccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ArdorAccountService = TestBed.get(ArdorAccountService);
    expect(service).toBeTruthy();
  });
});
