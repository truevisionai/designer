/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoadCuttingService } from './road-cutter.service';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { RoadFactory } from 'app/factories/road-factory.service';

describe( 'Service: RoadCutter', () => {

	let spline: AutoSplineV2;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadCuttingService ]
		} );

		spline = new AutoSplineV2();

	} );

	it( 'should ...', inject( [ RoadCuttingService ], ( service: RoadCuttingService ) => {

		expect( service ).toBeTruthy();

	} ) );

	it( 'should cut road in half', () => {

		// const road = RoadFactory.createDefaultRoad();

	} );

} );
