/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SurfaceToolService } from './surface-tool.service';

describe('Service: SurfaceTool', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SurfaceToolService]
    });
  });

  it('should ...', inject([SurfaceToolService], (service: SurfaceToolService) => {
    expect(service).toBeTruthy();
  }));
});
