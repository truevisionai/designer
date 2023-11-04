/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoadToolService } from './road-tool.service';

describe('Service: RoadTool', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoadToolService]
    });
  });

  it('should ...', inject([RoadToolService], (service: RoadToolService) => {
    expect(service).toBeTruthy();
  }));
});
