/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GraphViewportComponent } from './graph-viewport.component';

describe('GraphViewportComponent', () => {
  let component: GraphViewportComponent;
  let fixture: ComponentFixture<GraphViewportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphViewportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
