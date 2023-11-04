/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PropPointService } from './prop-point.service';

describe('Service: PropPoint', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PropPointService]
    });
  });

  it('should ...', inject([PropPointService], (service: PropPointService) => {
    expect(service).toBeTruthy();
  }));
});
