/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapQueries } from '../queries/tv-map-queries';
import { TvMapInstance } from '../services/tv-map-source-file';
import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';
import { TvMap } from './tv-map.model';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoad } from './tv-road.model';

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

	beforeEach( () => {

		map = new TvMap();

		TvMapInstance.map = map;

		road = map.addRoad( '', 10, 1, -1 );

		road.addPlanView();

		laneSection = new TvLaneSection( 1, 0, true, road );

		road.getLaneSections().push( laneSection );

		laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, true, true );
		leftTwo = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.driving, true, true );
		leftThree = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
		leftOne = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );

		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
		rightOne = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, true, true );
		rightThree = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true );
		rightTwo = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, true, true );
		rightFour = laneSection.getLastAddedLane();

		laneSection.getLaneVector().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.addWidthRecord( 0, 2, 0, 0, 0 );

			}

		} );

	} );

	it( 'should give correct road id ', () => {

		road.addGeometryLine( 0, 0, 0, 0, 10 );

		const result = TvMapQueries.getRoadByCoords( 1, 1 );

		expect( result.id ).toBe( 1 );

	} );

	it( 'should give correct lane id for left lane', () => {

		road.addGeometryLine( 0, 0, 0, 0, 10 );

		const posTheta = new TvPosTheta();

		const result = TvMapQueries.getLaneByCoords( 1, 1, posTheta );

		expect( result.road.id ).toBe( 1 );
		expect( result.lane.id ).toBe( 1 );

		const result2 = TvMapQueries.getLaneByCoords( 1, 3, posTheta );

		expect( result2.road.id ).toBe( 1 );
		expect( result2.lane.id ).toBe( 2 );

	} );

	it( 'should give correct lane id for right lane', () => {

		road.addGeometryLine( 0, 0, 0, 0, 10 );

		const posTheta = new TvPosTheta();

		const result = TvMapQueries.getLaneByCoords( 1, -1, posTheta );

		expect( result.road.id ).toBe( 1 );
		expect( result.lane.id ).toBe( -1 );

	} );

} );
