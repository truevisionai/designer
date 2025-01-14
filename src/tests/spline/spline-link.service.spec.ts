import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineLinkService } from 'app/managers/spline-link.service';
import { MapService } from 'app/services/map/map.service';
import { RoadService } from 'app/services/road/road.service';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { expectValidMap } from 'tests/base-test.spec';
import { Vector3 } from 'app/core/maths';

describe( 'SplineLinkService: Tests', () => {

	let testHelper: SplineTestHelper;
	let mapService: MapService;
	let eventServiceProvider: EventServiceProvider;
	let splineLinkService: SplineLinkService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService, MatSnackBar ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineLinkService = TestBed.inject( SplineLinkService );
		testHelper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	it( 'should update simple connected splines', () => {

		/**
		 * -------------------------------
		 *  	R1 	=> 	|	  R2	 => 	| 	=>	R3
		 * -------------------------------
		 */

		testHelper.add3ConnectedSplines();

		const R1 = mapService.getRoad( 1 );
		const R2 = mapService.getRoad( 2 );
		const R3 = mapService.getRoad( 3 );

		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R1.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R3.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expect( R1.successor.element ).toBe( R2 );
		expect( R2.predecessor.element ).toBe( R1 );
		expect( R2.successor.element ).toBe( R3 );
		expect( R3.predecessor.element ).toBe( R2 );

		expectValidMap( mapService );

		// update middle spline
		R2.spline.getControlPoints().forEach( point => point.position.y = 1 );

		testHelper.splineService.update( R2.spline );

		R1.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 1 ) );
		R2.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 1 ) );
		R3.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 1 ) );

		// ensue even after update, the connections are still valid
		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R1.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R3.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expectValidMap( mapService );

		// update middle spline again
		R2.spline.getControlPoints().forEach( point => point.position.y += 1 );

		testHelper.splineService.update( R2.spline );

		R1.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 2 ) );
		R2.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 2 ) );
		R3.spline.getControlPoints().forEach( point => expect( point.position.y ).toBe( 2 ) );

		// ensue even after update, the connections are still valid
		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R1.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R3.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expectValidMap( mapService );


	} );

	it( 'should update complex connected splines', () => {

		/**
		 * --------------------------------------------
		 *  	R1  =>	|	<=  R2	 	| => R3
		 * --------------------------------------------
		 */

		testHelper.add3ConnectedSplinesv2();

		const R1 = mapService.getRoad( 1 );
		const R2 = mapService.getRoad( 2 );
		const R3 = mapService.getRoad( 3 );

		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R3.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R1.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expect( R1.successor.element ).toBe( R2 );
		expect( R2.predecessor.element ).toBe( R3 );
		expect( R2.successor.element ).toBe( R1 );
		expect( R3.predecessor.element ).toBe( R2 );

		expect( R1.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( -100 );
		expect( R1.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 );

		expect( R2.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 )
		expect( R2.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 )

		expect( R3.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 )
		expect( R3.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 200 )

		expectValidMap( mapService );

		// update middle spline
		R2.spline.getControlPoints().forEach( point => point.position.y += 1 );

		testHelper.splineService.update( R2.spline );

		R1.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 1 ) );
		R2.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 1 ) );
		R3.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 1 ) );

		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R1.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R3.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expect( R1.successor.element ).toBe( R2 );
		expect( R2.predecessor.element ).toBe( R3 );
		expect( R2.successor.element ).toBe( R1 );
		expect( R3.predecessor.element ).toBe( R2 );

		expect( R1.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( -100 );
		expect( R1.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 );

		expect( R2.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 )
		expect( R2.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 )

		expect( R3.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 )
		expect( R3.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 200 )

		expectValidMap( mapService );

		// update middle spline
		R2.spline.getControlPoints().forEach( point => point.position.y += 1 );

		testHelper.splineService.update( R2.spline );

		R1.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 2 ) );
		R2.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 2 ) );
		R3.spline.getControlPoints().forEach( point => expect( point.position.y ).toBeCloseTo( 2 ) );

		expect( ( R1.spline.getSuccessorSpline() ) ).toBe( R2.spline );
		expect( ( R2.spline.getSuccessorSpline() ) ).toBe( R1.spline );
		expect( ( R2.spline.getPredecessorSpline() ) ).toBe( R3.spline );
		expect( ( R3.spline.getPredecessorSpline() ) ).toBe( R2.spline );

		expect( R1.successor.element ).toBe( R2 );
		expect( R2.predecessor.element ).toBe( R3 );
		expect( R2.successor.element ).toBe( R1 );
		expect( R3.predecessor.element ).toBe( R2 );

		expect( R1.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( -100, 1 );	// low precision
		expect( R1.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 );

		expect( R2.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 );
		expect( R2.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 0 );

		expect( R3.spline.controlPointPositions[ 0 ].x ).toBeCloseTo( 100 )
		expect( R3.spline.controlPointPositions[ 1 ].x ).toBeCloseTo( 200, 1 );		// low precision

		expectValidMap( mapService );

		testHelper.mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should update connected splines with junction at end', () => {

		AbstractSpline.reset();

		testHelper.addCustomJunctionWith2Roads();

		testHelper.addStraightRoadSpline( new Vector3( 100, -50, 0 ), 100, 90 );

		expect( mapService.getJunctionCount() ).toBe( 2 );
		expect( mapService.findJunction( 1 ).auto ).toBe( false );
		expect( mapService.findJunction( 2 ).auto ).toBe( true );

		const spline = mapService.findSplineById( 2 );

		expect( spline ).toBeDefined();
		expect( spline.getControlPointCount() ).toBe( 2 );

		spline.getControlPoints().forEach( point => point.position.y += 1 );

		testHelper.splineService.update( spline );

		expectValidMap( mapService );

		testHelper.mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should update connected splines with junction at start', () => {

		AbstractSpline.reset();

		testHelper.addCustomJunctionWith2Roads();

		testHelper.addStraightRoadSpline( new Vector3( -60, -50, 0 ), 100, 90 );

		expect( mapService.getJunctionCount() ).toBe( 2 );
		expect( mapService.findJunction( 1 ).auto ).toBe( false );
		expect( mapService.findJunction( 2 ).auto ).toBe( true );

		const spline = mapService.findSplineById( 1 );

		expect( spline ).toBeDefined();
		expect( spline.getControlPointCount() ).toBe( 2 );

		spline.getControlPoints().forEach( point => point.position.y += 1 );

		testHelper.splineService.update( spline );

		expectValidMap( mapService );

		expect( spline.getSegmentCount() ).toBe( 3 );

		testHelper.mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should update connected splines with junction in the middle', () => {

		AbstractSpline.reset();

		testHelper.create2CustomJunctionWith3Roads();

		expect( mapService.getJunctionCount() ).toBe( 2 );
		expect( mapService.findJunction( 1 ).auto ).toBe( false );
		expect( mapService.findJunction( 2 ).auto ).toBe( false );

		const R1 = mapService.getRoad( 1 );
		const R2 = mapService.getRoad( 2 );
		const R3 = mapService.getRoad( 3 );
		const J1 = mapService.findJunction( 1 );
		const J2 = mapService.findJunction( 2 );

		expect( R1.successor.element ).toBe( J1 );
		expect( R2.predecessor.element ).toBe( J1 );
		expect( R2.successor.element ).toBe( J2 );
		expect( R3.predecessor.element ).toBe( J2 );

		testHelper.addStraightRoadSpline( new Vector3( 50, -50, 0 ), 100, 90 );

		const J3 = mapService.findJunction( 3 );

		expect( R1.successor.element ).toBe( J1 );
		expect( R2.predecessor.element ).toBe( J1 );
		expect( R2.successor.element ).toBe( J3 );
		expect( R3.predecessor.element ).toBe( J2 );

		expectValidMap( mapService );

		testHelper.mapValidator.validateMap( mapService.map, true );

	} );

} );
