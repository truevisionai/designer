/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadDividerTool } from './road-divider-tool';
import { RoadDividerToolService } from './road-divider-tool.service';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { Vector3 } from 'three';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { expectValidMap } from 'tests/base-test.spec';
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { RoadService } from 'app/services/road/road.service';

describe( 'RoadDividerTool', () => {

	let tool: RoadDividerTool;
	let roadService: RoadService;
	let testHelper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadDividerToolService, EventServiceProvider ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );
		testHelper = TestBed.inject( SplineTestHelper );
		tool = new RoadDividerTool( TestBed.inject( RoadDividerToolService ) );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		roadService = TestBed.inject( RoadService );

		eventServiceProvider.init();
	} );

	it( 'should divide road in two parts', () => {

		const R1 = testHelper.addStraightRoad( new Vector3( 0, 0, 0 ) );

		const roadCoord: TvRoadCoord = R1.getRoadCoord( 50 );

		const clone = tool.divideRoadAt( roadCoord );

		tool.onObjectAdded( clone );

		expect( R1.length ).toBe( 50 );
		expect( R1.predecessor ).toBeUndefined();
		expect( R1.successor.element ).toBe( clone );
		expect( R1.successor.contact ).toBe( TvContactPoint.START );

		expect( clone.length ).toBe( 50 );
		expect( clone.predecessor.element ).toBe( R1 );
		expect( clone.predecessor.contact ).toBe( TvContactPoint.END );

		expect( testHelper.mapService.nonJunctionRoads.length ).toBe( 2 );

		expectValidMap( testHelper.mapService );

	} );


	it( 'should divide road with objects and signals in two parts', () => {

		const R1 = testHelper.addStraightRoad( new Vector3( 0, 0, 0 ) );

		let signalId = 0;

		for ( let s = 0; s < R1.getLength(); s++ ) {

			const object = RoadObjectFactory.createMockRoadObject();

			object.road = R1;

			object.s = s;

			R1.addRoadObject( object );

			const signal = RoadSignalFactory.createMockRoadSignal();

			signal.id = signalId++;

			signal.setRoad( R1 );

			signal.s = s;

			R1.addSignal( signal );

		}

		expect( R1.getRoadObjectCount() ).toBe( 100 );
		expect( R1.getSignalCount() ).toBe( 100 );

		const roadCoord: TvRoadCoord = R1.getRoadCoord( 50 );

		const R2 = tool.divideRoadAt( roadCoord );

		tool.onObjectAdded( R2 );

		expect( R1.getLength() ).toBe( 50 );
		expect( R1.predecessor ).toBeUndefined();
		expect( R1.successor.element ).toBe( R2 );
		expect( R1.successor.contact ).toBe( TvContactPoint.START );
		expect( R1.getRoadObjectCount() ).toBe( 50 );
		expect( R1.getSignalCount() ).toBe( 50 );

		expect( R2.getLength() ).toBe( 50 );
		expect( R2.predecessor.element ).toBe( R1 );
		expect( R2.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R2.getRoadObjectCount() ).toBe( 50 );
		expect( R2.getSignalCount() ).toBe( 50 );

		expect( testHelper.mapService.nonJunctionRoads.length ).toBe( 2 );

		expectValidMap( testHelper.mapService );

	} );


	it( 'should divide road connected to junction in two parts', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const J1 = testHelper.mapService.findJunction( 1 );
		const R1 = testHelper.mapService.findRoad( 1 );

		const R1Length = R1.getLength();

		const newRoad = tool.divideRoadAt( R1.getRoadCoord( 10 ) );

		tool.onObjectAdded( newRoad );

		expect( R1.length ).toBe( 10 );
		expect( R1.predecessor ).toBeUndefined();
		expect( R1.successor.element ).toBe( newRoad );
		expect( R1.successor.contact ).toBe( TvContactPoint.START );

		expect( newRoad.length ).toBeGreaterThan( 25 );
		expect( newRoad.predecessor.element ).toBe( R1 );
		expect( newRoad.predecessor.contact ).toBe( TvContactPoint.END );
		expect( newRoad.successor.element ).toBeInstanceOf( TvJunction );
		expect( newRoad.successor.element.id ).toBe( J1.id );

		expect( testHelper.mapService.nonJunctionRoads.length ).toBe( 5 );

		expectValidMap( testHelper.mapService );

		// now testing undo pert

		tool.onObjectRemoved( newRoad );

		expect( R1.length ).toBe( R1Length );
		expect( R1.predecessor ).toBeUndefined();
		expect( R1.successor.element ).toBeInstanceOf( TvJunction );
		expect( R1.successor.element.id ).toBe( J1.id );

		expect( testHelper.mapService.nonJunctionRoads.length ).toBe( 4 );

		expectValidMap( testHelper.mapService );

	} ) );

	it( 'should divide road on circular road', fakeAsync( () => {

		testHelper.addCircleRoad( 50 );

		tick( 1000 );

		const R1 = testHelper.mapService.findRoad( 1 );
		const R2 = testHelper.mapService.findRoad( 2 );
		const R3 = testHelper.mapService.findRoad( 3 );
		const R4 = testHelper.mapService.findRoad( 4 );

		const R1Length = R1.getLength();

		const R5 = tool.divideRoadAt( R1.getRoadCoord( 10 ) );

		tool.onObjectAdded( R5 );

		expect( R1.length ).toBe( 10 );
		expect( R1.predecessor.element ).toBe( R4 );
		expect( R1.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R1.successor.element ).toBe( R5 );
		expect( R1.successor.contact ).toBe( TvContactPoint.START );

		expect( R5.length ).toBe( R1Length - 10 );
		expect( R5.predecessor.element ).toBe( R1 );
		expect( R5.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R5.successor.element ).toBe( R2 );
		expect( R5.successor.contact ).toBe( TvContactPoint.START );

		expect( R2.predecessor.element ).toBe( R5 );
		expect( R2.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R2.successor.contact ).toBe( TvContactPoint.START );

		expect( testHelper.mapService.roads.length ).toBe( 5 );

		expectValidMap( testHelper.mapService );

		// now testing undo pert

		tool.onObjectRemoved( R5 );

		expect( R1.length ).toBe( R1Length );
		expect( R1.predecessor.element ).toBe( R4 );
		expect( R1.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R1.successor.element ).toBe( R2 );
		expect( R1.successor.contact ).toBe( TvContactPoint.START );

		// expect( R1.length ).toBe( R1Length );
		expect( R2.predecessor.element ).toBe( R1 );
		expect( R2.predecessor.contact ).toBe( TvContactPoint.END );
		expect( R2.successor.element ).toBe( R3 );
		expect( R2.successor.contact ).toBe( TvContactPoint.START );

		expect( testHelper.mapService.roads.length ).toBe( 4 );

		expectValidMap( testHelper.mapService );

	} ) );


} );
