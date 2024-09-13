/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SplineIntersectionService } from './spline-intersection.service';

describe( 'Service: SplineIntersection', () => {

	let service: SplineIntersectionService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ SplineIntersectionService ]
		} );

		service = TestBed.get( SplineIntersectionService );

	} );

	xit( 'should ...', inject( [ SplineIntersectionService ], ( service: SplineIntersectionService ) => {
		expect( service ).toBeTruthy();
	} ) );

	xit( 'should detect intersection in auto & auto spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in auto & explicit spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in explicit & explicit spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in crossing xodr & auto spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in crossing xodr & explicit spline', () => {
		expect( true ).toBe( false );
	} );


} );
