/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TvJunctionCornerRoadService } from './tv-junction-corner-road.service';
import { CROSSING8_XODR, SplineTestHelper, TOWN_01, TOWN_02 } from "../../services/spline/spline-test-helper.service";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "../../listeners/event-service-provider";
import { TvContactPoint } from '../models/tv-common';

describe( 'TvJunctionCornerRoadService', () => {

	let service: TvJunctionCornerRoadService;

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		testHelper = TestBed.inject( SplineTestHelper );

		TestBed.inject( EventServiceProvider ).init();

		service = TestBed.inject( TvJunctionCornerRoadService );

	} );

	it( 'should be created', () => {

		expect( service ).toBeTruthy();

	} );

	it( 'should find corner connection on 2-road-junction', () => {

		const junction = testHelper.addCustomJunctionWith2Roads();

		const cornerConnections = service.getJunctionCornerConnections( junction );

		expect( cornerConnections.length ).toBe( 2 );

	} );

	it( 'should find corner connections on t-junction', () => {

		testHelper.createSimpleTJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		const cornerConnections = service.getJunctionCornerConnections( junction );

		expect( cornerConnections.length ).toBe( 3 );

		cornerConnections.forEach( connection => {

			expect( connection.getIncomingLaneCount() ).toBe( 7 );

			expect( connection.getLinkCount() ).toBe( 1 );

			const incomingLaneId = connection.getLinks()[ 0 ].incomingLane.id;

			expect( Math.abs( incomingLaneId ) ).toBe( 3 );

		} );

	} );

	it( 'should find corner connection on t-junction', () => {

		testHelper.createSimpleTJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		const ROAD1 = testHelper.mapService.findRoad( 1 );

		const cornerConnection = service.getCornerConnectionForRoad( junction, ROAD1 );

		expect( cornerConnection.getLinkCount() ).toBe( 1 );
		expect( cornerConnection.getLinks()[ 0 ].incomingLane.id ).toBe( -3 );

	} );

	it( 'should find corner connections on 4-way-junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		expect( junction ).toBeDefined();

		const cornerConnections = service.getJunctionCornerConnections( junction );

		expect( cornerConnections.length ).toBe( 4 );

		cornerConnections.forEach( connection => {
			expect( connection.getLinkCount() ).toBe( 1 );
		} )

	} ) );

	it( 'should find corner connections on imported crossing-8.xodr', async () => {

		const map = await testHelper.loadAndParseXodr( CROSSING8_XODR );

		const junction = map.getJunctions()[ 0 ];

		const cornerConnections = service.getJunctionCornerConnections( junction );

		expect( cornerConnections.length ).toBe( 4 );

		// in the import map the corner connections have 3 links
		expect( cornerConnections[ 0 ].getLinkCount() ).toBe( 3 );
		expect( cornerConnections[ 1 ].getLinkCount() ).toBe( 3 );
		expect( cornerConnections[ 2 ].getLinkCount() ).toBe( 3 );
		expect( cornerConnections[ 3 ].getLinkCount() ).toBe( 3 );

	} );

	it( 'should find corner connections on imported town-01.xodr', async () => {

		const map = await testHelper.loadAndParseXodr( TOWN_01 );

		expect( map.getJunctionCount() ).toBeGreaterThan( 10 );

		map.getJunctions().forEach( junction => {

			const cornerConnections = service.getJunctionCornerConnections( junction );

			expect( cornerConnections.length ).toBeGreaterThanOrEqual( 3 );

		} );

	} );

	it( 'should find corner connections on imported town-02.xodr', async () => {

		const map = await testHelper.loadAndParseXodr( TOWN_02 );

		expect( map.getJunctionCount() ).toBe( 8 );

		map.getJunctions().forEach( junction => {

			const cornerConnections = service.getJunctionCornerConnections( junction );

			expect( cornerConnections.length ).toBeGreaterThanOrEqual( 3 );

		} );

	} );

} );
