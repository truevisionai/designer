/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { setupTest } from "../../../tests/setup-tests";
import { TvRoad } from "../../map/models/tv-road.model";
import { SplineTestHelper } from "../../services/spline/spline-test-helper.service";
import { TestBed } from "@angular/core/testing";
import { RoadFactory } from "../../factories/road-factory.service";
import { Vector3 } from "three";
import { TvLaneType, TvOrientation } from "../../map/models/tv-common";
import { findOrientation } from "../../map/models/connections/connection-utils";

describe( 'RoadRampTool', () => {

	let mainRoad: TvRoad;

	beforeEach( () => {

		setupTest();

		mainRoad = TestBed.inject( SplineTestHelper ).createStraightRoad();

	} );

	it( 'should return exit for point ahead of right-lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 25 );

		expect( findOrientation( start, new Vector3( 50, -50, 0 ) ) ).toBe( TvOrientation.PLUS );
		expect( findOrientation( start, new Vector3( 26, -50, 0 ) ) ).toBe( TvOrientation.PLUS );
		expect( findOrientation( start, new Vector3( 25, -50, 0 ) ) ).toBe( TvOrientation.PLUS );

	} );

	it( 'should return entry for points behind of right-lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 25 );

		expect( findOrientation( start, new Vector3( 0, -50, 0 ) ) ).toBe( TvOrientation.MINUS );
		expect( findOrientation( start, new Vector3( 24, -50, 0 ) ) ).toBe( TvOrientation.MINUS );
		expect( findOrientation( start, new Vector3( 24.9, -50, 0 ) ) ).toBe( TvOrientation.MINUS );

	} );

	it( 'should return exit for point behind of left-lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( 1 ).toLaneCoord( 25 );
		const end = new Vector3( 50, -50, 0 );

		expect( findOrientation( start, end ) ).toBe( TvOrientation.MINUS );

	} );

	it( 'should return entry for points ahead of left-lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( 1 ).toLaneCoord( 25 );
		const end = new Vector3( 0, -50, 0 );

		expect( findOrientation( start, end ) ).toBe( TvOrientation.PLUS );

	} );

	it( 'should create right-turn slip road for right lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 0 );

		const end = new Vector3( 50, -50, 0 );

		const rampRoad = RoadFactory.createRampRoad( start, end );

		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 6 );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( 2 ).getType() ).toBe( TvLaneType.sidewalk );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( 1 ).getType() ).toBe( TvLaneType.shoulder );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( 0 ).getType() ).toBe( TvLaneType.none );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).getType() ).toBe( TvLaneType.driving );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( -2 ).getType() ).toBe( TvLaneType.shoulder );
		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneById( -3 ).getType() ).toBe( TvLaneType.sidewalk );

	} );

	it( 'should create right-turn slip road for left lane', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 0 );

		const end = new Vector3( 50, 50, 0 );

		const rampRoad = RoadFactory.createRampRoad( start, end );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
			TvLaneType.sidewalk,
			TvLaneType.shoulder,
			TvLaneType.driving,
			TvLaneType.none,
			TvLaneType.driving,
			TvLaneType.shoulder,
			TvLaneType.sidewalk,
		] );

	} );

	it( 'should create left-turn slip road for left lane', () => {

	} );

	it( 'should create left-turn slip road for right lane', () => {

	} );

} );

