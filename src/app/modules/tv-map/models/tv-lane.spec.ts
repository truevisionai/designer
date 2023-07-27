/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapInstance } from '../services/tv-map-source-file';
import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';
import { TvMap } from './tv-map.model';

describe( 'OpenDrive LaneSection', () => {

	let laneSection: TvLaneSection;

	let leftOne: TvLane;
	let leftTwo: TvLane;
	let leftThree: TvLane;
	let rightOne: TvLane;
	let rightTwo: TvLane;
	let rightThree: TvLane;
	let rightFour: TvLane;

	beforeEach( () => {

		laneSection = new TvLaneSection( 1, 0, true, null );

		laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, false, true );
		leftTwo = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.driving, false, true );
		leftThree = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		leftOne = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		rightOne = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, false, true );
		rightThree = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, false, true );
		rightTwo = laneSection.getLastAddedLane();

		laneSection.addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, false, true );
		rightFour = laneSection.getLastAddedLane();

		laneSection.getLaneArray().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.addWidthRecord( 0, 2, 0, 0, 0 );

			}

		} );

	} );

	it( 'should add right lane correcty', () => {

		expect( laneSection.lanes.size ).toBe( 8 );

		const clone = laneSection.lanes.get( -2 ).clone();

		laneSection.addLaneInstance( clone );

		expect( laneSection.lanes.size ).toBe( 9 );
		expecttCorrectOrderOfLanes( laneSection );

		laneSection.removeLane( clone );

		expect( laneSection.lanes.size ).toBe( 8 );
		expecttCorrectOrderOfLanes( laneSection );

	} );

	it( 'should add right lane correcty', () => {

		expect( laneSection.lanes.size ).toBe( 8 );

		const clone = laneSection.lanes.get( -2 ).clone( -3 );

		laneSection.addLaneInstance( clone );

		expect( laneSection.lanes.size ).toBe( 9 );
		expecttCorrectOrderOfLanes( laneSection );

		laneSection.removeLane( clone );

		expect( laneSection.lanes.size ).toBe( 8 );
		expecttCorrectOrderOfLanes( laneSection );

	} );

} );

function expecttCorrectOrderOfLanes ( laneSection: TvLaneSection ) {

	laneSection.getLeftLanes().forEach( ( lane, index, items ) => {
		const laneId = items.length - index;
		expect( lane.id ).toBe( laneId );
	} );

	laneSection.getRightLanes().forEach( ( lane, index ) => {
		const laneId = index + 1
		expect( lane.id ).toBe( -laneId );
	} );

}
