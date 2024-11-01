/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/* tslint:disable:no-unused-variable */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SplineTestHelper } from '../spline/spline-test-helper.service';
import { setupTest } from "../../../tests/setup-tests";

describe( 'Service: JunctionRoad', () => {

	let helper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

	} );

	it( 'should handle default-junction', fakeAsync( () => {

		helper.addDefaultJunction( false );

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = junction.getIncomingRoads();

		const incomingSplines = junction.getIncomingSplines();

		const connectingRoads = junction.getConnectingRoads();

		expect( incomingRoads.length ).toBe( 4 );

		expect( incomingSplines.length ).toBe( 2 );

		expect( connectingRoads.length ).toBe( 20 );							// 1 for each link

	} ) );

	it( 'should handle t-junction', fakeAsync( () => {

		helper.createTJunctionWith3Roads();

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = junction.getIncomingRoads();

		const incomingSplines = junction.getIncomingSplines();

		const connectingRoads = junction.getConnectingRoads();

		expect( incomingRoads.length ).toBe( 3 );

		expect( incomingSplines.length ).toBe( 3 );

		expect( connectingRoads.length ).toBe( 12 );							// 1 for each link

	} ) );

	it( 'should handle t-junction with 2 roads', fakeAsync( () => {

		helper.createSimpleTJunction();

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoads = junction.getIncomingRoads();

		const incomingSplines = junction.getIncomingSplines();

		const connectingRoads = junction.getConnectingRoads();

		expect( incomingRoads.length ).toBe( 3 );

		expect( incomingSplines.length ).toBe( 2 );

		expect( connectingRoads.length ).toBe( 12 );							// 1 for each link

	} ) );


} );
