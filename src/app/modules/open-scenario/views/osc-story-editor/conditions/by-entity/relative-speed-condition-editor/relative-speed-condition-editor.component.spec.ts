import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeSpeedConditionEditorComponent } from './relative-speed-condition-editor.component';

describe( 'RelativeSpeedConditionEditorComponent', () => {
	let component: RelativeSpeedConditionEditorComponent;
	let fixture: ComponentFixture<RelativeSpeedConditionEditorComponent>;

	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ RelativeSpeedConditionEditorComponent ]
		} )
			.compileComponents();
	} ) );

	beforeEach( () => {
		fixture = TestBed.createComponent( RelativeSpeedConditionEditorComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
