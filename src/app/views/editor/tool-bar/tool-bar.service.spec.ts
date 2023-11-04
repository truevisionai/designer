/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ToolBarService } from './tool-bar.service';

describe('Service: ToolBar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolBarService]
    });
  });

  it('should ...', inject([ToolBarService], (service: ToolBarService) => {
    expect(service).toBeTruthy();
  }));
});
