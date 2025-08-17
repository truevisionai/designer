/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { CROSSING8_XODR, SplineTestHelper, TOWN_01 } from "app/services/spline/spline-test-helper.service";
import { TvLaneBoundary } from "../tv-lane-boundary";
import { TvJointBoundary } from "../tv-joint-boundary";
import { setupTest } from "../../../../tests/setup-tests";

xdescribe( 'TvJunctionInnerBoundaryService', () => {

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );

	} );

	it( 'should create inner boundary for junction between 2 roads', () => {

		const junction = testHelper.addCustomJunctionWith2Roads();

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 4 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );

	} );

	it( 'should create inner boundary for 4-way-junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 8 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 7 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create inner boundary for t-junction', fakeAsync( () => {

		testHelper.createSimpleTJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 6 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create inner boundary import junction', async () => {

		const map = await testHelper.loadAndParseXodr( CROSSING8_XODR );

		const junction = map.getJunctions()[ 0 ];

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( junction.getConnectionCount() ).toBe( 12 );
		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} );

	it( 'should create inner boundary import junction new', async () => {

		const map = await testHelper.loadAndParseXodr( TOWN_01 );

		const junction = map.getJunction( 184 );

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( junction.getConnectionCount() ).toBe( 6 );
		expect( boundary.getSegmentCount() ).toBe( 7 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvLaneBoundary );

	} );


} )

xdescribe( 'TvJunctionOuterBoundaryService', () => {

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );

	} );

	it( 'should create outer boundary for junction between 2 roads', () => {

		const junction = testHelper.addCustomJunctionWith2Roads();

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 4 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );

	} );

	it( 'should create outer boundary for 4-way-junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 7 ] ).toBeInstanceOf( TvJointBoundary );

	} ) );

	it( 'should create outer boundary for t-junction', fakeAsync( () => {

		testHelper.createSimpleTJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( boundary.getSegmentCount() ).toBe( 6 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create outer boundary crossing 8 xodr', async () => {

		const map = await testHelper.loadAndParseXodr( CROSSING8_XODR );

		const junction = map.getJunctions()[ 0 ];

		const boundary = junction.outerBoundary;

		junction.updateBoundary();

		expect( junction.getConnectionCount() ).toBe( 12 );
		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} );


} )

