/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvJunctionBoundary } from './tv-junction-boundary';
import { CROSSING8_XODR, SplineTestHelper, TOWN_01 } from 'app/services/spline/spline-test-helper.service';
import { setupTest } from 'tests/setup-tests';
import { TvJointBoundary } from './tv-joint-boundary';
import { TvLaneBoundary } from './tv-lane-boundary';
import { expectInstancesOf } from "../../../tests/expect-spline.spec";

xdescribe( 'TvJunctionBoundaryProfile', () => {

	let testHelper: SplineTestHelper;
	let junction: TvJunction;
	let boundary: TvJunctionBoundary;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );

	} );

	describe( 'DefaultJunction', () => {

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

	describe( 'DefaultJunction Without Sidewalks', () => {

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

	describe( 'Town-01', () => {

		// TODO: fix this test
		xit( 'should create inner boundary import junction', async () => {

			const map = await testHelper.loadAndParseXodr( TOWN_01 );

			const junction = map.getJunction( 77 );

			const boundary = junction.outerBoundary;

			junction.updateBoundary();

			expect( junction.getConnectionCount() ).toBe( 6 );
			expect( boundary.getSegmentCount() ).toBe( 10 );

			// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
			// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
			// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
			// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
			// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
			// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );
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

	} )

} );
