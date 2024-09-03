/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vector3FieldComponent } from './vector3-field.component';
import { Vector3 } from 'three';

describe( 'Vector3FieldComponent', () => {

	let component: Vector3FieldComponent;
	let fixture: ComponentFixture<Vector3FieldComponent>;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			declarations: [ Vector3FieldComponent ]
		} ).compileComponents();
	} );

	beforeEach( () => {
		fixture = TestBed.createComponent( Vector3FieldComponent );
		component = fixture.componentInstance;
		component.value = new Vector3();
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should update x value correctly', () => {
		const newValue = 5;
		component.onXChanged( newValue.toString() );
		expect( component.value.x ).toBe( newValue );
	} );

	it( 'should update y value correctly', () => {
		const newValue = 10;
		component.onYChanged( newValue.toString() );
		expect( component.value.y ).toBe( newValue );
	} );

	it( 'should update z value correctly', () => {
		component.z = true;
		const newValue = 15;
		component.onZChanged( newValue.toString() );
		expect( component.value.z ).toBe( newValue );
	} );

	it( 'should not update x value when disabled', () => {
		component.disabled = true;
		const newValue = 10;
		component.onXChanged( newValue.toString() );
		expect( component.value.x ).not.toBe( newValue );
	} );

	it( 'should set x value to 0 when NaN', () => {
		const newValue = 'invalid';
		component.onXChanged( newValue );
		expect( component.value.x ).toBe( 0 );
	} );

	it( 'should emit valueChanged event when x value is updated', () => {
		const newValue = 15;
		let emittedValue: Vector3;
		component.valueChanged.subscribe( ( value: Vector3 ) => {
			emittedValue = value;
		} );
		component.onXChanged( newValue.toString() );
		expect( emittedValue ).toEqual( component.value );
	} );

	it( 'should emit changed event when x value is updated', () => {
		const newValue = 20;
		let emittedValue: Vector3;
		component.changed.subscribe( ( value: Vector3 ) => {
			emittedValue = value;
		} );
		component.onXChanged( newValue.toString() );
		expect( emittedValue ).toEqual( component.value );
	} );

} );
