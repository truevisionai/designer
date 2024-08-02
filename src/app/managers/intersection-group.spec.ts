import { IntersectionGroup } from "./Intersection-group";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector3 } from "three";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { HttpClientModule } from "@angular/common/http";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SplineManager } from "./spline-manager";
import { JunctionManager } from "./junction-manager";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { AbstractSpline } from "app/core/shapes/abstract-spline";

describe( 'IntersectionGroup', () => {

	let splineTestHelper: SplineTestHelper;
	let splineManager: SplineManager;
	let junctionManager: JunctionManager;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		splineManager = TestBed.inject( SplineManager );
		junctionManager = TestBed.inject( JunctionManager );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	it( 'should give correct start for spline intersection', () => {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 200, 90 );
		const splineC = SplineFactory.createStraight( new Vector3( -100, -100, 0 ), 200, 45 );

		splineManager.addSpline( splineA );
		splineManager.addSpline( splineB );
		splineManager.addSpline( splineC );

		const intersections = splineTestHelper.splineService.findIntersections( splineA );

		expect( intersections.length ).toBe( 2 );

		const group = new IntersectionGroup( intersections.shift() );

		intersections.forEach( intersection => {
			group.addSplineIntersection( intersection );
		} )

		expect( group.intersections.size ).toBe( 2 );
		expect( group.getSplines().length ).toBe( 3 );

		expect( group.getOffset( splineA ).sStart ).toBeLessThan( 85 );
		expect( group.getOffset( splineA ).sEnd ).toBeGreaterThan( 115 );

		expect( group.getOffset( splineB ).sStart ).toBeLessThan( 92 );
		expect( group.getOffset( splineB ).sEnd ).toBeGreaterThan( 108 );

		expect( group.getOffset( splineC ).sStart ).toBeLessThan( 125 );
		expect( group.getOffset( splineC ).sEnd ).toBeGreaterThan( 155 );

	} );

	it( 'should detect 1 group for star junction', fakeAsync( () => {

		splineTestHelper.addSixRoadJunction();

		const spline = junctionManager.mapService.splines[ 0 ];

		const intsersections = splineTestHelper.splineService.findIntersections( spline );

		expect( intsersections.length ).toBe( 2 );

		const groups = junctionManager.createGroups( intsersections );

		expect( groups.length ).toBe( 1 );

		expect( groups[ 0 ].getSplines().length ).toBe( 3 );

	} ) );

	it( 'should detect 1 group for circle-default-junction', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.addCircleRoad( 50 );

		let response: { horizontal: AbstractSpline; vertical: AbstractSpline; };

		( async () => {
			response = await splineTestHelper.addDefaultJunction();
		} )();

		tick( 1000 );

		const intsersections = splineTestHelper.splineService.findIntersections( response.vertical );

		expect( intsersections.length ).toBe( 5 );

		const groups = junctionManager.createGroups( intsersections );

		expect( groups.length ).toBe( 3 );

		expect( groups[ 0 ].getSplines().length ).toBe( 3 );
		expect( groups[ 0 ].intersections.size ).toBe( 3 );

		expect( groups[ 1 ].getSplines().length ).toBe( 3 );
		expect( groups[ 1 ].intersections.size ).toBe( 3 );

		expect( groups[ 2 ].getSplines().length ).toBe( 2 );
		expect( groups[ 2 ].intersections.size ).toBe( 1 );


	} ) );


} );
