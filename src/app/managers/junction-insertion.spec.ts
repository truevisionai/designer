/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { JunctionFactory } from "app/factories/junction.factory";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { SplineUtils } from "app/utils/spline.utils";
import { Vector3 } from "three";
import { JunctionManager } from "./junction-manager";
import { SplineManager } from "./spline-manager";
import { TvContactPoint } from "app/map/models/tv-common";
import { expectCorrectSegmentOrder } from "tests/base-test.spec";
import { AbstractSpline, NewSegment } from "app/core/shapes/abstract-spline";
import { TvLink, TvLinkType } from "app/map/models/tv-link";
import { LinkFactory } from 'app/map/models/link-factory';

describe( 'JunctionManager: InsertJunction', () => {

	let splineTestHelper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;
	let mapService: MapService;
	let junctionManager: JunctionManager;
	let splineManager: SplineManager;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			providers: [ JunctionManager ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		mapService = TestBed.inject( MapService );
		junctionManager = TestBed.inject( JunctionManager );
		splineManager = TestBed.inject( SplineManager );
		eventServiceProvider.init();

	} );

	function expectOffsets ( spline: AbstractSpline, offsets: number[] ) {

		const keys = [ ...spline.segmentMap.keys() ];

		expect( keys.length ).toBe( offsets.length );

		for ( let i = 0; i < offsets.length; i++ ) {

			expect( keys[ i ] ).toEqual( offsets[ i ] );

		}

	}

	function expectInstances ( spline: AbstractSpline, types: any[] ) {

		const values = [ ...spline.segmentMap.values() ];

		expect( values.length ).toBe( types.length );

		for ( let i = 0; i < types.length; i++ ) {

			expect( values[ i ] ).toBeInstanceOf( types[ i ] );

		}

	}

	function expectSegments ( spline: AbstractSpline, segments: NewSegment[] ) {

		const values = [ ...spline.segmentMap.values() ];

		const keys = [ ...spline.segmentMap.keys() ];

		expect( values.length ).toBe( segments.length );

		for ( let i = 0; i < segments.length; i++ ) {

			expect( values[ i ] ).toBe( segments[ i ] );

			if ( values[ i ] instanceof TvRoad ) {

				const road = values[ i ] as TvRoad;

				expect( road.sStart ).toBe( keys[ i ] );

			}

		}

	}

	function expectCoords ( spline: AbstractSpline, junction: TvJunction, expected: TvLink[] ) {

		const coords = junctionManager.getJunctionLinks( spline, junction );

		expect( coords.length ).toBe( expected.length );

		for ( let i = 0; i < coords.length; i++ ) {

			expect( coords[ i ].matches( expected[ i ] ) ).toBeTrue();

		}

	}

	it( 'should insert junction on spline with single road', () => {

		const J1 = JunctionFactory.create();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 1 );

		junctionManager.insertJunction( spline, 40, 60, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 3 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 40, 60 ] );

		expectInstances( spline, [ TvRoad, TvJunction, TvRoad ] );

		const R2 = mapService.findRoad( 2 );

		expectSegments( spline, [ R1, J1, R2 ] );

		const coords = junctionManager.getJunctionLinks( spline, J1 );
		expect( coords.length ).toBe( 2 );
		expect( spline.segmentMap.getFirst() ).toBe( coords[ 0 ].element );
		expect( coords[ 0 ].contactPoint ).toBe( TvContactPoint.END );
		expect( spline.segmentMap.getLast() ).toBe( coords[ 1 ].element );
		expect( coords[ 1 ].contactPoint ).toBe( TvContactPoint.START );

	} );

	it( 'should insert junction in middle on spline with two roads', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();
		const R2 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );
		SplineUtils.addSegment( spline, 50, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 40, 60, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 3 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 40, 60 ] );

		expectInstances( spline, [ TvRoad, TvJunction, TvRoad ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R1, TvContactPoint.END ),
			LinkFactory.createRoadLink( R2, TvContactPoint.START )
		] );

	} );

	it( 'should insert second junction before first junction', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();
		const J2 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ), 300 );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();
		const R2 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );
		SplineUtils.addSegment( spline, 190, J1 );
		SplineUtils.addSegment( spline, 210, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 3 );

		junctionManager.insertJunction( spline, 90, 110, J2 );

		junctionManager.updateSplineInternalLinks( spline );

		const R3 = mapService.findRoad( 3 );

		expect( spline.getSegmentCount() ).toBe( 5 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 90, 110, 190, 210 ] );

		expectInstances( spline, [ TvRoad, TvJunction, TvRoad, TvJunction, TvRoad ] );

		expectSegments( spline, [ R1, J2, R3, J1, R2 ] );

		expectCoords( spline, J2, [
			LinkFactory.createRoadLink( R1, TvContactPoint.END ),
			LinkFactory.createRoadLink( R3, TvContactPoint.START )
		] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R3, TvContactPoint.END ),
			LinkFactory.createRoadLink( R2, TvContactPoint.START )
		] );

	} );

	it( 'should insert at end with existing roads before junction', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();
		const R2 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );
		SplineUtils.addSegment( spline, 50, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 80, 100, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 3 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 50, 80 ] );

		expectInstances( spline, [ TvRoad, TvRoad, TvJunction ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R2, TvContactPoint.END ),
		] );

	} );

	it( 'should insert at end and remove full covered road', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();
		const R2 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );
		SplineUtils.addSegment( spline, 80, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 70, 100, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 2 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 70 ] );

		expectInstances( spline, [ TvRoad, TvJunction ] );

		expectSegments( spline, [ R1, J1 ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R1, TvContactPoint.END ),
		] );

		expect( mapService.hasRoad( 2 ) ).toBeFalse();

	} );

	it( 'should insert start with two roads after junction', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R2 = splineTestHelper.roadFactory.createDefaultRoad();
		const R1 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );

		SplineUtils.addSegment( spline, 80, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 0, 20, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 3 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 20, 80 ] );

		expectInstances( spline, [ TvJunction, TvRoad, TvRoad ] );

		expectSegments( spline, [ J1, R1, R2 ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R1, TvContactPoint.START ),
		] );

	} );

	it( 'should insert junction at start on spline with two roads', () => {

		const junction = JunctionFactory.create();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const secondRoad = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.addSpline( spline, false );

		SplineUtils.addSegment( spline, 20, secondRoad );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 0, 30, junction );

		junctionManager.updateSplineInternalLinks( spline );

		expect( spline.getSegmentCount() ).toBe( 2 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 30 ] );

		expectInstances( spline, [ TvJunction, TvRoad ] );

		expectSegments( spline, [ junction, secondRoad ] );

		expectCoords( spline, junction, [
			LinkFactory.createRoadLink( secondRoad, TvContactPoint.START ),
		] );

	} );

	it( 'should insert junction at start on spline with two roads', () => {

		const J1 = JunctionFactory.create();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ) );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();
		const R2 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, R1 );

		SplineUtils.addSegment( spline, 40, R2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 2 );

		junctionManager.insertJunction( spline, 0, 50, J1 );

		junctionManager.updateSplineInternalLinks( spline );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 50 ] );

		expectInstances( spline, [ TvJunction, TvRoad ] );

		expectSegments( spline, [ J1, R2 ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R2, TvContactPoint.START ),
		] );

		expect( mapService.hasRoad( 1 ) ).toBeFalse();

	} );

	it( 'should insert 3rd junction between 2 existing junctions', () => {

		const J1 = splineTestHelper.junctionFactory.createByType();
		const J2 = splineTestHelper.junctionFactory.createByType();
		const J3 = splineTestHelper.junctionFactory.createByType();

		const spline = splineTestHelper.createStraightSpline( new Vector3( 0, 0, 0 ), 200 );

		const R1 = splineTestHelper.roadFactory.createDefaultRoad();

		splineManager.buildSpline( spline );

		SplineUtils.addSegment( spline, 0, J1 );
		SplineUtils.addSegment( spline, 20, R1 );
		SplineUtils.addSegment( spline, 180, J2 );

		splineManager.addSpline( spline, false );

		expect( spline.getSegmentCount() ).toBe( 3 );

		junctionManager.insertJunction( spline, 90, 110, J3 );

		junctionManager.updateSplineInternalLinks( spline );

		const R2 = mapService.findRoad( 2 );

		expect( spline.getSegmentCount() ).toBe( 5 );

		expectCorrectSegmentOrder( spline );

		expectOffsets( spline, [ 0, 20, 90, 110, 180 ] );

		expectInstances( spline, [ TvJunction, TvRoad, TvJunction, TvRoad, TvJunction ] );

		expectSegments( spline, [ J1, R1, J3, R2, J2 ] );

		expectCoords( spline, J1, [
			LinkFactory.createRoadLink( R1, TvContactPoint.START )
		] );

		expectCoords( spline, J3, [
			LinkFactory.createRoadLink( R1, TvContactPoint.END ),
			LinkFactory.createRoadLink( R2, TvContactPoint.START )
		] );

		expectCoords( spline, J2, [
			LinkFactory.createRoadLink( R2, TvContactPoint.END ),
		] );

	} );

} );
