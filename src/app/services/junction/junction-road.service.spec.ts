/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/* tslint:disable:no-unused-variable */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JunctionRoadService } from './junction-road.service';
import { SplineTestHelper } from '../spline/spline-test-helper.service';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { disableMeshBuilding } from 'app/modules/builder/builders/od-builder-config';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

describe( 'Service: JunctionRoad', () => {

	let service: JunctionRoadService;
	let helper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		service = TestBed.inject( JunctionRoadService );
		helper = TestBed.inject( SplineTestHelper );

		eventServiceProvider.init();

	} );

	it( 'should create instance', () => {

		expect( service ).toBeTruthy();

	} );

	it( 'should handle default-junction', fakeAsync( () => {

		helper.addDefaultJunction( false );

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = service.getIncomingRoads( junction );

		const incomingSplines = service.getIncomingSplines( junction );

		const connectingRoads = service.getConnectingRoads( junction );

		expect( incomingRoads.length ).toBe( 4 );

		expect( incomingSplines.length ).toBe( 2 );

		expect( connectingRoads.length ).toBe( 20 );							// 1 for each link

	} ) );

	it( 'should handle t-junction', fakeAsync( () => {

		helper.createTJunctionWith3Roads();

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = service.getIncomingRoads( junction );

		const incomingSplines = service.getIncomingSplines( junction );

		const connectingRoads = service.getConnectingRoads( junction );

		expect( incomingRoads.length ).toBe( 3 );

		expect( incomingSplines.length ).toBe( 3 );

		expect( connectingRoads.length ).toBe( 12 );							// 1 for each link

	} ) );

	it( 'should handle t-junction with 2 roads', fakeAsync( () => {

		helper.createSimpleTJunction();

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = service.getIncomingRoads( junction );

		const incomingSplines = service.getIncomingSplines( junction );

		const connectingRoads = service.getConnectingRoads( junction );

		expect( incomingRoads.length ).toBe( 3 );

		expect( incomingSplines.length ).toBe( 2 );

		expect( connectingRoads.length ).toBe( 12 );							// 1 for each link

	} ) );


} );
