import { IntersectionGroup } from "./Intersection-group";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector3 } from "three";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SplineManager } from "./spline-manager";

describe( 'IntersectionGroup', () => {

	let splineTestHelper: SplineTestHelper;
	let splineManager: SplineManager;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		splineManager = TestBed.inject( SplineManager );

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

		// // const group = new IntersectionGroup( intersection );
		// expect( intersections[ 0 ].splineStart ).toBe( 100 );
		// expect( intersections[ 0 ].splineEnd ).toBe( 100 );
		// expect( intersections[ 0 ].otherStart ).toBe( 100 );
		// expect( intersections[ 0 ].otherEnd ).toBe( 100 );

		const group = new IntersectionGroup( intersections.shift() );

		intersections.forEach( intersection => {
			group.addSplineIntersection( intersection );
		} )

		expect( group.intersections.size ).toBe( 2 );
		expect( group.getSplines().length ).toBe( 3 );

		group.intersections.forEach( intersection => {
			console.error( intersection.spline.uuid, intersection.splineStart, intersection.splineEnd );
			console.error( intersection.otherSpline.uuid, intersection.otherStart, intersection.otherEnd );
		} );

		expect( group.getOffset( splineA ).sStart ).toBeLessThan( 85 );
		expect( group.getOffset( splineA ).sEnd ).toBeGreaterThan( 115 );

		expect( group.getOffset( splineB ).sStart ).toBeLessThan( 92 );
		expect( group.getOffset( splineB ).sEnd ).toBeGreaterThan( 108 );

		expect( group.getOffset( splineC ).sStart ).toBeLessThan( 125 );
		expect( group.getOffset( splineC ).sEnd ).toBeGreaterThan( 155 );

	} );


} );
