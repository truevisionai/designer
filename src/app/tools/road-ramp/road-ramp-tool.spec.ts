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
import { createFreewayRoad, createRampRoad } from "tests/base-test.spec";

describe( 'RoadRampTool Orientation', () => {

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

} );

describe( 'RoadRampTool', () => {

	let mainRoad: TvRoad;

	beforeEach( () => {

		setupTest();

		mainRoad = TestBed.inject( SplineTestHelper ).createStraightRoad();

	} );

	it( 'should create entry from right to right on default road', () => {

		const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 0 );

		const end = new Vector3( 0, -50, 0 );

		const rampRoad = createRampRoad( start, end );

		expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 6 );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 2, 1, 0, -1, -2, -3 ] );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
			TvLaneType.sidewalk,
			TvLaneType.shoulder,
			TvLaneType.none,
			TvLaneType.driving,
			TvLaneType.shoulder,
			TvLaneType.sidewalk,
		] );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.isLeft ) ).toEqual( [
			true,
			true,
			false,
			false,
			false,
			false,
		] );

	} );

	it( 'should create entry for right lane on freeway road', () => {

		const freeway = createFreewayRoad();

		const start = freeway.getLaneProfile().getFirstLaneSection().getLaneById( -5 ).toLaneCoord( 50 );

		const end = new Vector3( 0, -100, 0 );

		const rampRoad = createRampRoad( start, end );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 2, 1, 0, -1 ] );

		expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
			TvLaneType.shoulder,
			TvLaneType.driving,
			TvLaneType.none,
			TvLaneType.shoulder,
		] );

	} );

	describe( 'exits', () => {

		it( 'should create exit from right to right on default road', () => {

			const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 0 );

			const end = new Vector3( 50, -50, 0 );

			const rampRoad = createRampRoad( start, end );

			expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 6 );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 2, 1, 0, -1, -2, -3 ] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
				TvLaneType.sidewalk,
				TvLaneType.shoulder,
				TvLaneType.none,
				TvLaneType.driving,
				TvLaneType.shoulder,
				TvLaneType.sidewalk,
			] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.isLeft ) ).toEqual( [
				true,
				true,
				false,
				false,
				false,
				false,
			] );

		} );

		it( 'should create exit from right to left on default road', () => {

			const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ).toLaneCoord( 0 );

			const end = new Vector3( 50, 50, 0 );

			const rampRoad = createRampRoad( start, end );

			expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 7 );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 3, 2, 1, 0, -1, -2, -3 ] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
				TvLaneType.sidewalk,
				TvLaneType.shoulder,
				TvLaneType.driving,
				TvLaneType.none,
				TvLaneType.driving,
				TvLaneType.shoulder,
				TvLaneType.sidewalk,
			] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.isLeft ) ).toEqual( [
				true,
				true,
				true,
				false,
				false,
				false,
				false,
			] );

		} );

		it( 'should create exit for right lane on freeway road', () => {

			const freeway = createFreewayRoad();

			const start = freeway.getLaneProfile().getFirstLaneSection().getLaneById( -5 ).toLaneCoord( 0 );

			const end = new Vector3( 50, -50, 0 );

			const rampRoad = createRampRoad( start, end );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 1, 0, -1, -2 ] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
				TvLaneType.shoulder,
				TvLaneType.none,
				TvLaneType.driving,
				TvLaneType.shoulder,
			] );

		} );

		it( 'should create exit with 2 right lanes on freeway road', () => {

			const freeway = createFreewayRoad();

			const start = freeway.getLaneProfile().getFirstLaneSection().getLaneById( -4 ).toLaneCoord( 0 );

			const end = new Vector3( 50, -50, 0 );

			const rampRoad = createRampRoad( start, end );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 1, 0, -1, -2, -3 ] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
				TvLaneType.shoulder,
				TvLaneType.none,
				TvLaneType.driving,
				TvLaneType.driving,
				TvLaneType.shoulder,
			] );

		} );

		xit( 'should create exit from left to left on default road', () => {

			const start = mainRoad.getLaneProfile().getFirstLaneSection().getLaneById( 1 ).toLaneCoord( 50 );

			const end = new Vector3( 0, 50, 0 );

			const rampRoad = createRampRoad( start, end );

			expect( rampRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 6 );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.id ) ).toEqual( [ 2, 1, 0, -1, -2, -3 ] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.getType() ) ).toEqual( [
				TvLaneType.sidewalk,
				TvLaneType.shoulder,
				TvLaneType.none,
				TvLaneType.driving,
				TvLaneType.shoulder,
				TvLaneType.sidewalk,
			] );

			expect( rampRoad.getLaneProfile().getLanes().map( lane => lane.isLeft ) ).toEqual( [
				true,
				true,
				false,
				false,
				false,
				false,
			] );

		} );

	} );

	it( 'should create left-turn slip road for left lane', () => {

	} );

	it( 'should create left-turn slip road for right lane', () => {

	} );

} );

