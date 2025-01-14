/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IntersectionGroup } from "./Intersection-group";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector3 } from "app/core/maths"
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { JunctionManager } from "./junction-manager";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineIntersectionService } from "app/services/spline/spline-intersection.service";
import { setupTest } from "tests/setup-tests";

describe( 'IntersectionGroup', () => {

	let splineTestHelper: SplineTestHelper;
	let junctionManager: JunctionManager;
	let intersectionService: SplineIntersectionService;

	beforeEach( () => {

		setupTest();

		splineTestHelper = TestBed.inject( SplineTestHelper );
		junctionManager = TestBed.inject( JunctionManager );
		intersectionService = TestBed.inject( SplineIntersectionService );

	} );

	it( 'should give correct start for spline intersection', () => {

		const splineA = SplineFactory.createStraightSplineAndPoints( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraightSplineAndPoints( new Vector3( 0, -100, 0 ), 200, 90 );
		const splineC = SplineFactory.createStraightSplineAndPoints( new Vector3( -100, -100, 0 ), 200, 45 );

		splineTestHelper.splineService.add( splineA );
		splineTestHelper.splineService.add( splineB );
		splineTestHelper.splineService.add( splineC );

		const intersections = intersectionService.findIntersections( splineA );

		expect( intersections.length ).toBe( 2 );

		const group = new IntersectionGroup( intersections.shift() );

		intersections.forEach( intersection => {
			group.addSplineIntersection( intersection );
		} )

		expect( group.getIntersectionCount() ).toBe( 2 );
		expect( group.getSplineCount() ).toBe( 3 );

		expect( group.getOffset( splineA ).sStart ).toBeLessThan( 85 );
		expect( group.getOffset( splineA ).sEnd ).toBeGreaterThan( 115 );

		expect( group.getOffset( splineB ).sStart ).toBeLessThan( 92 );
		expect( group.getOffset( splineB ).sEnd ).toBeGreaterThan( 108 );

		expect( group.getOffset( splineC ).sStart ).toBeLessThan( 125 );
		expect( group.getOffset( splineC ).sEnd ).toBeGreaterThan( 155 );

	} );

	it( 'should detect 1 group for star junction', fakeAsync( () => {

		splineTestHelper.addSixRoadJunction();

		tick( 1000 );

		const spline = junctionManager.mapService.splines[ 0 ];

		const intsersections = intersectionService.findIntersections( spline );

		expect( intsersections.length ).toBe( 2 );

		const groups = junctionManager.createGroups( intsersections );

		expect( groups.length ).toBe( 1 );

		expect( groups[ 0 ].getSplineCount() ).toBe( 3 );

	} ) );

	it( 'should detect 1 group for circle-default-junction', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.addCircleRoad( 50 );

		let response: { horizontal: AbstractSpline; vertical: AbstractSpline; };

		( async () => {
			response = await splineTestHelper.addDefaultJunction();
		} )();

		tick( 1000 );

		const intsersections = intersectionService.findIntersections( response.vertical );

		expect( intsersections.length ).toBe( 5 );

		const groups = junctionManager.createGroups( intsersections );

		expect( groups.length ).toBe( 3 );

		expect( groups[ 0 ].getSplineCount() ).toBe( 3 );
		expect( groups[ 0 ].getIntersectionCount() ).toBe( 3 );

		expect( groups[ 1 ].getSplineCount() ).toBe( 3 );
		expect( groups[ 1 ].getIntersectionCount() ).toBe( 3 );

		expect( groups[ 2 ].getSplineCount() ).toBe( 2 );
		expect( groups[ 2 ].getIntersectionCount() ).toBe( 1 );


	} ) );


} );
