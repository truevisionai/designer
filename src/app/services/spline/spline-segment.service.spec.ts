/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SplineSegmentService } from "./spline-segment.service";
import { MapEvents } from "app/events/map-events";
import { MapService } from "../map/map.service";
import { AutoSpline } from "app/core/shapes/auto-spline-v2";
import { createDefaultRoad } from "tests/base-test.spec";
import { SplineFactory } from "./spline.factory";

fdescribe( "SplineSegmentService mergeAdjacentRoadSegmentsIfCompatible", () => {

	let service: SplineSegmentService;
	let mapService: MapService;

	beforeEach( () => {
		mapService = new MapService();
		service = new SplineSegmentService( mapService as any );
	} );

	it( "merges compatible adjacent roads and removes redundant road", () => {

		const spline = SplineFactory.createSpline();
		const roadA = createDefaultRoad();
		const roadB = createDefaultRoad();

		mapService.addRoad( roadA );
		mapService.addRoad( roadB );

		spline.addSegment( 0, roadA );
		spline.addSegment( roadA.length, roadB );

		const removeMeshSpy = spyOn( MapEvents.removeMesh, 'emit' );

		const merged = service.mergeAdjacentRoadSegmentsIfCompatible( spline );

		expect( merged ).toBeTrue();
		expect( spline.getRoadSegments().length ).toBe( 1 );
		expect( mapService.hasRoad( roadB ) ).toBeFalse();
		expect( roadA.length ).toBeCloseTo( 20 );
		expect( roadA.getLaneProfile().getLaneSectionCount() ).toBe( 2 );
		expect( removeMeshSpy ).toHaveBeenCalledWith( roadB );
	} );

	it( "does not merge when lane sections differ", () => {

		const spline = SplineFactory.createSpline();
		const roadA = createDefaultRoad( { length: 10, rightLaneCount: 2 } );
		const roadB = createDefaultRoad( { length: 10, rightLaneCount: 1 } );

		mapService.addRoad( roadA );
		mapService.addRoad( roadB );

		spline.addSegment( 0, roadA );
		spline.addSegment( roadA.length, roadB );

		const merged = service.mergeAdjacentRoadSegmentsIfCompatible( spline );

		expect( merged ).toBeFalse();
		expect( spline.getRoadSegments().length ).toBe( 2 );
		expect( mapService.hasRoad( roadB ) ).toBeTrue();
	} );
} );
