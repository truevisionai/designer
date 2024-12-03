/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';

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

		leftTwo = laneSection.createLeftLane( 2, TvLaneType.driving, false, true );

		leftThree = laneSection.createLeftLane( 3, TvLaneType.driving, false, true );

		leftOne = laneSection.createLeftLane( 1, TvLaneType.driving, false, true );

		laneSection.createCenterLane( 0, TvLaneType.driving, false, true );

		rightOne = laneSection.createRightLane( -1, TvLaneType.driving, false, true );

		rightThree = laneSection.createRightLane( -3, TvLaneType.driving, false, true );

		rightTwo = laneSection.createRightLane( -2, TvLaneType.driving, false, true );

		rightFour = laneSection.createRightLane( -4, TvLaneType.driving, false, true );

		laneSection.getLanes().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.addWidthRecord( 0, 2, 0, 0, 0 );

			}

		} );

	} );

	it( 'should add right lane correcty', () => {

		expect( laneSection.getLaneCount() ).toBe( 8 );

		const clone = laneSection.getLaneById( -2 ).clone();

		laneSection.addLaneInstance( clone );

		expect( laneSection.getLaneCount() ).toBe( 9 );
		// expecttCorrectOrderOfLanes( laneSection );

		laneSection.removeLane( clone );

		expect( laneSection.getLaneCount() ).toBe( 8 );
		// expecttCorrectOrderOfLanes( laneSection );

	} );

	it( 'should add right lane correcty', () => {

		expect( laneSection.getLaneCount() ).toBe( 8 );

		const clone = laneSection.getLaneById( -2 ).clone( -3 );

		laneSection.addLaneInstance( clone );

		expect( laneSection.getLaneCount() ).toBe( 9 );
		// expecttCorrectOrderOfLanes( laneSection );

		laneSection.removeLane( clone );

		expect( laneSection.getLaneCount() ).toBe( 8 );
		// expecttCorrectOrderOfLanes( laneSection );

	} );

} );

function expecttCorrectOrderOfLanes ( laneSection: TvLaneSection ): void {

	laneSection.getLeftLanes().forEach( ( lane, index, items ) => {
		const laneId = items.length - index;
		expect( lane.id ).toBe( laneId );
	} );

	laneSection.getRightLanes().forEach( ( lane, index ) => {
		const laneId = index + 1;
		expect( lane.id ).toBe( -laneId );
	} );

}
