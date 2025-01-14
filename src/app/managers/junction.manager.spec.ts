/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { JunctionManager } from "./junction-manager";
import { SplineFactory } from "../services/spline/spline.factory";
import { Vector3 } from "app/core/maths"
import { TvPosTheta } from "../map/models/tv-pos-theta";
import { Maths } from "../utils/maths";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { SplineManager } from "./spline-manager";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";
import { SplineIntersectionService } from "app/services/spline/spline-intersection.service";
import { SplinePositionService } from "app/services/spline/spline-position.service";
import { setupTest } from "tests/setup-tests";

describe( 'JunctionManager', () => {

	let splineTestHelper: SplineTestHelper;
	let mapService: MapService;
	let junctionManager: JunctionManager;
	let splineManager: SplineManager;
	let intersctionService: SplineIntersectionService;
	let splinePositionService: SplinePositionService;

	beforeEach( () => {

		setupTest();

		splineTestHelper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );
		junctionManager = TestBed.inject( JunctionManager );
		splineManager = TestBed.inject( SplineManager );
		intersctionService = TestBed.inject( SplineIntersectionService );
		splinePositionService = TestBed.inject( SplinePositionService );

		disableMeshBuilding();

	} );

	it( 'should create correctly', () => {
		expect( junctionManager ).toBeTruthy();
	} );

	it( 'should give correct output for getCoordAtOffset', () => {

		const splineA = SplineFactory.createStraightSplineAndPoints( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraightSplineAndPoints( new Vector3( 0, -100, 0 ), 200, 90 );

		splineA.updateSegmentGeometryAndBounds();
		splineB.updateSegmentGeometryAndBounds();

		const coords: TvPosTheta[] = [];

		const entryA = splinePositionService.getCoordAtOffset( splineA, 90 );
		const exitA = splinePositionService.getCoordAtOffset( splineA, 110 );
		const entryB = splinePositionService.getCoordAtOffset( splineB, 90 );
		const exitB = splinePositionService.getCoordAtOffset( splineB, 110 );

		coords.push( entryA );
		coords.push( exitA );
		coords.push( entryB );
		coords.push( exitB );

		for ( let i = 0; i < coords.length; i++ ) {

			const coord = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const otherCoord = coords[ j ];

				const distance = coord.position.distanceTo( otherCoord.position );

				expect( distance ).toBeGreaterThan( 10 );

				expect( distance ).toBeLessThan( 30 );

			}

		}


	} );

	xit( 'should give adjust spline coords', () => {

		const desiredRadius = 50;

		// 90 degrees
		const distance90 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( Math.PI / 2 ) ) / 2 );
		expect( distance90 ).toBeCloseTo( 9.9 );

		// 45 degrees
		const distance45 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( Math.PI / 4 ) ) / 2 );
		expect( distance45 ).toBeCloseTo( 20.7 );

		// 135 degrees
		const distance135 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( 3 * Math.PI / 4 ) ) / 2 );
		expect( distance135 ).toBeCloseTo( 20.7 );

	} );

	it( 'should convert 2-spline-junction into 1 intersection', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const J1 = mapService.findJunction( 1 );

		expect( J1 ).toBeDefined();

		const intersections = J1.getSplineIntersections();

		expect( intersections.length ).toBe( 1 );

	} ) );

	it( 'should convert 3-spline-junction into 3 intersections', fakeAsync( () => {

		splineTestHelper.createTJunctionWith3Roads( false );

		tick( 1000 );

		const J1 = mapService.findJunction( 1 );

		expect( J1 ).toBeDefined();

		const intersections = J1.getSplineIntersections();

		expect( intersections.length ).toBe( 3 );

	} ) );

	it( 'should convert 4-spline-junction into 6 intersections', fakeAsync( () => {

		splineTestHelper.createXJunctionWithFourRoads( false );

		tick( 1000 );

		const J1 = mapService.findJunction( 1 );

		expect( J1 ).toBeDefined();

		const intersections = J1.getSplineIntersections();

		expect( intersections.length ).toBe( 6 );

	} ) );

	it( 'should detect no new intersections when spline is updated', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const spline = mapService.splines[ 0 ];

		const newIntersections = junctionManager.findNewIntersections( spline );

		expect( newIntersections.length ).toBe( 0 );

	} ) );

	it( 'should detect new intersections when new spline is added into junction', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const spline = SplineFactory.createStraightSplineAndPoints( new Vector3( -100, -100, 0 ), 200, 45 );

		splineManager.addSpline( spline, false );

		const newIntersections = junctionManager.findNewIntersections( spline );

		expect( newIntersections.length ).toBe( 2 );

	} ) );

	it( 'should remove old junction and detect new intersction', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		// create new vertical spline
		const spline = SplineFactory.createStraightSplineAndPoints( new Vector3( 500, -100, 0 ), 200, 90 );
		splineManager.addSpline( spline, false );

		// then move old vertical spline
		mapService.splines[ 1 ].getControlPoints().forEach( cp => cp.position.x += 500 );

		splineManager.updateSpline( mapService.splines[ 1 ], false );

		expect( junctionManager.findNewIntersections( spline ).length ).toBe( 1 );

		expect( junctionManager.findNewIntersections( mapService.splines[ 1 ] ).length ).toBe( 1 );

	} ) );

	xit( 'should categorise junctions correctly for x-junction', fakeAsync( () => {

		// not in use

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const spline = SplineFactory.createStraightSplineAndPoints( new Vector3( 50, -100, 0 ), 200, 90 );

		splineManager.addSpline( spline, false );

		const junctions = spline.getJunctionSegments();
		const intersections = intersctionService.findIntersections( spline );
		const result = junctionManager.categorizeJunctions( junctions, intersections );

		expect( result.junctionsToCreate.length ).toBe( 1 );
		expect( result.junctionsToUpdate.length ).toBe( 0 );
		expect( result.junctionsToRemove.length ).toBe( 0 );

		junctionManager.detectJunctions( spline );

		{
			const horizontal = mapService.splines[ 0 ];
			const junctions = horizontal.getJunctionSegments();
			const intersections = intersctionService.findIntersections( horizontal );
			const result = junctionManager.categorizeJunctions( junctions, intersections );
			expect( result.junctionsToCreate.length ).toBe( 0 );
			expect( result.junctionsToUpdate.length ).toBe( 2 );
			expect( result.junctionsToRemove.length ).toBe( 0 );
		}

	} ) );

	xit( 'should categorise junctions correctly for t-junction', fakeAsync( () => {

		// not in use

		splineTestHelper.createTJunctionWith3Roads( false );

		tick( 1000 );

		const spline = mapService.splines[ 0 ];

		const junctions = spline.getJunctionSegments();
		const intersections = intersctionService.findIntersections( spline );
		const result = junctionManager.categorizeJunctions( junctions, intersections );

		expect( result.junctionsToCreate.length ).toBe( 0 );
		expect( result.junctionsToUpdate.length ).toBe( 1 );
		expect( result.junctionsToRemove.length ).toBe( 0 );

	} ) );

} );
