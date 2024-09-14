/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SplinePositionService } from './spline-position.service';

describe( 'Service: SplinePosition', () => {

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ SplinePositionService ]
		} );
	} );

	it( 'should ...', inject( [ SplinePositionService ], ( service: SplinePositionService ) => {
		expect( service ).toBeTruthy();
	} ) );

} );
