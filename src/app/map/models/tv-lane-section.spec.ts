/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSection } from "./tv-lane-section";
import { RoadFactory } from "../../factories/road-factory.service";

describe( 'LaneSection', () => {

	let laneSection: TvLaneSection;

	beforeEach( () => {

		const road = RoadFactory.createDefaultRoad();
		laneSection = road.getLaneProfile().getFirstLaneSection();

	} );

	it( 'should give correct lane count', () => {

		expect( laneSection.getLaneCount() ).toBe( 7 );
		expect( laneSection.getNonCenterLanes().length ).toBe( 6 );

	} );

	it( 'should give correct right carriageway boundary', () => {

		expect( laneSection.getRightCarriagewayBoundary() ).toBe( -2 );

	} );

	it( 'should give correct left carriageway boundary', () => {

		expect( laneSection.getLeftCarriagewayBoundary() ).toBe( 2 );

	} );

} );
