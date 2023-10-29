/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoadManeuverService } from './road-maneuver.service';

describe( 'Service: RoadManeuver', () => {
	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadManeuverService ]
		} );
	} );

	it( 'should ...', inject( [ RoadManeuverService ], ( service: RoadManeuverService ) => {
		expect( service ).toBeTruthy();
	} ) );
} );
