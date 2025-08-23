/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvJunctionBoundary } from './tv-junction-boundary';
import { CROSSING8_XODR, SplineTestHelper, TONGJI, TOWN_01 } from 'app/services/spline/spline-test-helper.service';
import { setupTest } from 'tests/setup-tests';
import { TvJointBoundary } from './tv-joint-boundary';
import { TvLaneBoundary } from './tv-lane-boundary';
import { expectInstancesOf } from "../../../tests/expect-spline.spec";
import { isCounterClockwise, isSimplePolygon, normalizeRing, segmentsAreChained } from 'tests/geometry.spec';
import { TvRoad } from "../models/tv-road.model";
import { TvMap } from "../models/tv-map.model";

describe( 'TvJunctionBoundaryProfile', () => {

	let testHelper: SplineTestHelper;
	let junction: TvJunction;
	let boundary: TvJunctionBoundary;

	beforeEach( () => {

		setupTest();

		TvRoad.resetCounter( 0 );

		testHelper = TestBed.inject( SplineTestHelper );

	} );

	xdescribe( 'DefaultJunction', () => {

		beforeEach( () => {

			junction = testHelper.createDefaultJunction();

			boundary = junction.getBoundary();

			junction.updateBoundary();

		} );

		it( 'should have 8 segments for default junction', () => {

			expect( boundary.getSegmentCount() ).toEqual( 8 );

		} );

		it( 'should have correct order of segments for default junction', () => {

			expectInstancesOf( boundary.getSegments(), [
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
			] );

		} );


		it( 'should have correct joint segments', () => {

			const jointSegments: TvJointBoundary[] = boundary.getSegments()
				.filter( segment => segment instanceof TvJointBoundary ) as TvJointBoundary[];

			expect( jointSegments.length ).toEqual( 4 );

			expect( jointSegments[ 0 ].getJointLaneStart().isSidewalk ).toBeTrue();
			expect( jointSegments[ 0 ].getJointLaneEnd().isSidewalk ).toBeTrue();

			// TODO: fix this assertion
			// expect( jointSegments[ 1 ].getJointLaneStart().isSidewalk ).toBeTrue();
			expect( jointSegments[ 1 ].getJointLaneEnd().isSidewalk ).toBeTrue();

			expect( jointSegments[ 2 ].getJointLaneStart().isSidewalk ).toBeTrue();
			expect( jointSegments[ 2 ].getJointLaneEnd().isSidewalk ).toBeTrue();

			// TODO: fix this assertion
			// expect( jointSegments[ 3 ].getJointLaneStart().isSidewalk ).toBeTrue();
			expect( jointSegments[ 3 ].getJointLaneEnd().isSidewalk ).toBeTrue();


		} );

		it( 'should have correct lane segments', () => {

			const laneSegments: TvLaneBoundary[] = boundary.getSegments()
				.filter( segment => segment instanceof TvLaneBoundary ) as TvLaneBoundary[];

			expect( laneSegments.length ).toEqual( 4 );

			expect( laneSegments[ 0 ].getLane().isSidewalk ).toBeTrue();
			expect( laneSegments[ 1 ].getLane().isSidewalk ).toBeTrue();
			expect( laneSegments[ 2 ].getLane().isSidewalk ).toBeTrue();
			expect( laneSegments[ 3 ].getLane().isSidewalk ).toBeTrue();

		} );

	} )

	xdescribe( 'DefaultJunction Without Sidewalks', () => {

		beforeEach( () => {

			junction = testHelper.createDefaultJunction();

			junction.getConnections().forEach( connection => {

				connection.getLaneLinks().forEach( link => {

					if ( !link.incomingLane.isDrivingLane || !link.connectingLane.isDrivingLane ) {

						connection.removeLink( link );
						connection.connectingLaneSection.removeLane( link.connectingLane );

					}

				} );

			} );

			junction.updateBoundary();

			boundary = junction.getBoundary();

		} );

		it( 'should have 8 segments for default junction', () => {

			expect( boundary.getSegmentCount() ).toEqual( 8 );

		} );

		it( 'should have correct order of segments for default junction', () => {

			expectInstancesOf( boundary.getSegments(), [
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
				TvJointBoundary,
				TvLaneBoundary,
			] );

		} );

		it( 'should have correct joint segments', () => {

			const jointSegments: TvJointBoundary[] = boundary.getSegments()
				.filter( segment => segment instanceof TvJointBoundary ) as TvJointBoundary[];

			expect( jointSegments.length ).toEqual( 4 );

			expect( jointSegments[ 0 ].getJointLaneStart().isDrivingLane ).toBeTrue();
			expect( jointSegments[ 0 ].getJointLaneEnd().isDrivingLane ).toBeTrue();

			expect( jointSegments[ 1 ].getJointLaneStart().isDrivingLane ).toBeTrue();
			expect( jointSegments[ 1 ].getJointLaneEnd().isDrivingLane ).toBeTrue();

			expect( jointSegments[ 2 ].getJointLaneStart().isDrivingLane ).toBeTrue();
			expect( jointSegments[ 2 ].getJointLaneEnd().isDrivingLane ).toBeTrue();

			expect( jointSegments[ 3 ].getJointLaneStart().isDrivingLane ).toBeTrue();
			expect( jointSegments[ 3 ].getJointLaneEnd().isDrivingLane ).toBeTrue();


		} );

		it( 'should have correct lane segments', () => {

			const laneSegments: TvLaneBoundary[] = boundary.getSegments()
				.filter( segment => segment instanceof TvLaneBoundary ) as TvLaneBoundary[];

			expect( laneSegments.length ).toEqual( 4 );

			expect( laneSegments[ 0 ].getLane().isDrivingLane ).toBeTrue();
			expect( laneSegments[ 1 ].getLane().isDrivingLane ).toBeTrue();
			expect( laneSegments[ 2 ].getLane().isDrivingLane ).toBeTrue();
			expect( laneSegments[ 3 ].getLane().isDrivingLane ).toBeTrue();


		} );

	} )

	describe( 'Tongji', () => {

		let map: TvMap;
		let junction: TvJunction;

		beforeEach( async () => {
			map = await testHelper.loadAndParseXodr( TONGJI );
		} );

		it( 'should have correct segment count', async () => {

			const junction = map.getJunction( 332 );

			expect( junction.getConnectionCount() ).toBe( 3 );

			junction.getBoundaryProfile().update();

			expect( junction.getBoundary().getSegmentCount() ).toBe( 6 );

		} );

	} );

	describe( 'Town-01', () => {

		let map: TvMap;
		let junction: TvJunction;

		beforeEach( async () => {

			map = await testHelper.loadAndParseXodr( TOWN_01 );

			junction = map.getJunction( 77 );

		} );

		// TODO: fix this test
		it( 'should create inner boundary import junction', async () => {

			junction.updateBoundary();

			const boundary = junction.getBoundary();

			// FOLLOW THIS
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89
			// https://chatgpt.com/c/68a23305-cae8-8321-8de0-7c74dfd35f89

			expect( junction.getConnectionCount() ).toBe( 6 );
			expect( boundary.getSegmentCount() ).toBe( 10 );

			// expectInstancesOf( boundary.getSegments(), [
			// 	TvJointBoundary,
			// 	TvLaneBoundary,
			// 	TvLaneBoundary,
			// 	TvLaneBoundary,
			// 	TvLaneBoundary,
			// 	TvJointBoundary,
			// 	TvLaneBoundary,
			// 	TvJointBoundary,
			// 	TvLaneBoundary,
			// 	TvLaneBoundary,
			// ] );

			// Flatten segment points but avoid duplicating the joint at boundaries.
			const segmentPointArrays = boundary.getSegments().map( seg => seg.getPoints() );
			const flattened = segmentPointArrays
				.map( ( pts, idx ) => idx < segmentPointArrays.length - 1 ? pts.slice( 0, -1 ) : pts ) // drop last of each except final
				.flat();

			// Optional continuity check between segments
			expect( segmentsAreChained( segmentPointArrays ) ).toBe( true );

			// Build a clean closed ring
			const ring = normalizeRing( flattened );

			// 1) Closed & non-degenerate
			expect( ring.length ).toBeGreaterThanOrEqual( 4 ); // at least 3 unique + closing

			// every edge has nonzero length
			for ( let i = 0; i < ring.length - 1; i++ ) {
				const a = ring[ i ], b = ring[ i + 1 ];
				expect( Math.hypot( a.x - b.x, a.y - b.y ) ).toBeGreaterThan( 1e-6 );
			}

			// 2) Orientation (choose your convention)
			// Common convention for meshing / Three.js:
			// - Outer boundary: CCW
			// - Holes: CW
			expect( isCounterClockwise( ring ) ).toBe( true ); // or expect(isClockwise(ring)).toBe(true)

			// 3) Simplicity (no self-intersections)
			expect( isSimplePolygon( ring ) ).toBe( true );

		} );

		it( 'should pick correct outer lane', async () => {

			const junction = map.getJunction( 77 );
			const from = map.getRoad( 2 ).getStartCoord();
			const to = map.getRoad( 3 ).getEndCoord();

			const laneLink = junction.getBoundaryProfile().getOuterLaneLink( from, to );

			expect( laneLink ).toBeDefined();
			expect( laneLink.incomingLane.laneSection.road.id ).toBe( 2 );
			expect( laneLink.connectingLane.laneSection.road.id ).toBe( 83 );
			expect( laneLink.incomingLane.id ).toBe( -1 );
			expect( laneLink.incomingLane.isCarriageWay() ).toBe( true );

		} );

		it( 'should add correct lane segments', async () => {

			const junction = map.getJunction( 77 );
			const from = map.getRoad( 2 ).getStartCoord();
			const to = map.getRoad( 3 ).getEndCoord();

			junction.getBoundaryProfile().addLaneBoundaries( from, to );

			expect( junction.getBoundary().getSegmentCount() ).toBe( 4 );

			const positions = junction.getBoundary().getPositions();

		} );

		xit( 'should pick correct connection', async () => {

			junction.updateBoundary();

			const road3 = map.getRoad( 3 ).getEndCoord();
			const road2 = map.getRoad( 2 ).getStartCoord();

			const connection = junction.getBoundaryProfile().pickConnectingConnection( road3, road2 );

			expect( connection ).toBeDefined();
			expect( connection.connectingRoad.id ).toBe( 83 );

		} );

		xit( 'should pick correct lane-link', async () => {

			junction.updateBoundary();

			const road3 = map.getRoad( 3 ).getEndCoord();
			const road2 = map.getRoad( 2 ).getStartCoord();

			const connection = junction.getBoundaryProfile().pickConnectingConnection( road3, road2 );

			expect( connection ).toBeDefined();

		} );

	} )

} );
