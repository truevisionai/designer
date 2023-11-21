/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BaseToolService } from './base-tool.service';

describe('Service: BaseTool', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BaseToolService]
    });
  });

  it('should ...', inject([BaseToolService], (service: BaseToolService) => {
    expect(service).toBeTruthy();
  }));
});
