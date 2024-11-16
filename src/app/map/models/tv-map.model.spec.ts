/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MapService } from 'app/services/map/map.service';
import { TvMapQueries } from '../queries/tv-map-queries';
import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';
import { TvMap } from './tv-map.model';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoad } from './tv-road.model';
import { RoadService } from 'app/services/road/road.service';
import { Vector2 } from 'three';

describe( 'OpenDrive Model', () => {

	let map: TvMap;
	let road: TvRoad;
	let laneSection: TvLaneSection;

	let leftOne: TvLane;
	let leftTwo: TvLane;
	let leftThree: TvLane;
	let rightOne: TvLane;
	let rightTwo: TvLane;
	let rightThree: TvLane;
	let rightFour: TvLane;

	let mapService: MapService;
	let roadService: RoadService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ MapService, RoadService ]
		} );

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	beforeEach( () => {

		map = mapService.map;

		road = map.addNewRoad( '', 10, 1 );

		laneSection = new TvLaneSection( 1, 0, true, road );

		road.getLaneProfile().getLaneSections().push( laneSection );

		leftTwo = laneSection.createLane( TvLaneSide.LEFT, 2, TvLaneType.driving, false, true );

		leftThree = laneSection.createLane( TvLaneSide.LEFT, 3, TvLaneType.driving, false, true );

		leftOne = laneSection.createLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		rightOne = laneSection.createLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );

		rightThree = laneSection.createLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, false, true );

		rightTwo = laneSection.createLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, false, true );

		rightFour = laneSection.createLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, false, true );

		laneSection.getLanes().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.addWidthRecord( 0, 2, 0, 0, 0 );

			}

		} );

	} );

	it( 'should give correct road id ', () => {

		road.getPlanView().addGeometryLine( 0, 0, 0, 0, 10 );

		const result = roadService.findNearestRoad( new Vector2( 1, 1 ) );

		expect( result.id ).toBe( 1 );

	} );

	it( 'should give correct lane id for left lane', () => {

		road.getPlanView().addGeometryLine( 0, 0, 0, 0, 10 );

		const posTheta = new TvPosTheta();

		const result = TvMapQueries.getLaneByCoords( 1, 1, posTheta );

		expect( result.road.id ).toBe( 1 );
		expect( result.lane.id ).toBe( 1 );

		const result2 = TvMapQueries.getLaneByCoords( 1, 3, posTheta );

		expect( result2.road.id ).toBe( 1 );
		expect( result2.lane.id ).toBe( 2 );

	} );

	it( 'should give correct lane id for right lane', () => {

		road.getPlanView().addGeometryLine( 0, 0, 0, 0, 10 );

		const posTheta = new TvPosTheta();

		const result = TvMapQueries.getLaneByCoords( 1, -1, posTheta );

		expect( result.road.id ).toBe( 1 );
		expect( result.lane.id ).toBe( -1 );

	} );

} );
