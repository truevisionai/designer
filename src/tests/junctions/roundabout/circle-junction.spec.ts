import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { Log } from "app/core/utils/log";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { Vector3 } from "three";
import { expectValidMap } from "../../base-test.spec";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { expectValidRoad, setupTest, validateMap } from "tests/setup-tests";
import { expect2RoadJunction, expectTJunction, expectXJunction } from "tests/expect-junction.spec";

describe( '4-Road-Roundabout', () => {

	let helper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

		AbstractSpline.reset();

	} );

	it( 'should handle horizontal spline', fakeAsync( () => {

		helper.addCircleRoad( 50 );
		helper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		expectTJunction( helper.mapService.findJunction( 1 ) );
		expectTJunction( helper.mapService.findJunction( 2 ) );

		expectValidMap( helper.mapService );

		validateMap( helper.mapService.map );

	} ) );

	it( 'should handle horizontal spline movement', async () => {

		helper.addCircleRoad( 50 );

		const horizontal = helper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		// move the horizontal spline to right by 50
		horizontal.getControlPoints().forEach( point => point.position.x += 50 );

		helper.splineService.updateSpline( horizontal );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		expectXJunction( helper.mapService.findJunction( 1 ) );
		expect2RoadJunction( helper.mapService.findJunction( 2 ) );

		expectValidMap( helper.mapService );

	} );

	it( 'should handle default junction', fakeAsync( () => {

		Log.debug( 'should handle 4-road-circle & default junction' );

		helper.addCircleRoad( 50 );

		expect( helper.mapService.getJunctionCount() ).toBe( 0 );

		helper.addDefaultJunction();

		tick( 0 );

		expectValidMap( helper.mapService );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		tick( 100 );

		expect( helper.mapService.getJunctionCount() ).toBe( 5 );

		helper.mapService.junctions.forEach( junction => {
			if ( junction.id == 5 ) {
				expectXJunction( junction );
			} else {
				expectTJunction( junction );
			}
		} );

		expectValidMap( helper.mapService );

	} ) );

	it( 'should create simple connections through a circular road', () => {

		helper.addCircleRoad( 50 );
		helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		expectXJunction( helper.mapService.findJunction( 1 ) );
		expectXJunction( helper.mapService.findJunction( 2 ) );

		helper.mapService.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

	} )

	it( 'should pass validations when spline is removed', () => {

		helper.addCircleRoad( 50 );

		expect( helper.mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		helper.splineService.remove( horizontal.spline );

		expect( helper.mapService.map.getJunctionCount() ).toBe( 0 );

		helper.mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( helper.mapService );

		expect( helper.mapService.map.getRoadCount() ).toBe( 6 );

	} )

	it( 'should handle spline updation', () => {

		helper.addCircleRoad( 50 );

		expect( helper.mapService.getRoadCount() ).toBe( 4 );

		const road = helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		helper.splineService.update( road.spline );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		expectXJunction( helper.mapService.findJunction( 1 ) );
		expectXJunction( helper.mapService.findJunction( 2 ) );

		helper.mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( helper.mapService );

	} );

	it( 'should create 2 x-junctions in 2 steps', () => {

		helper.addCircleRoad( 50 );

		const road = helper.addStraightRoad( new Vector3( -50, -50 ), 50, 45 );

		expect( helper.mapService.getJunctionCount() ).toBe( 1 );

		expectXJunction( helper.mapService.findJunction( 1 ) );

		road.spline.addControlPoint( new Vector3( -100, 100, 0 ) );

		helper.splineService.update( road.spline );

		expect( helper.mapService.getJunctionCount() ).toBe( 2 );

		expectXJunction( helper.mapService.findJunction( 1 ) );
		expectXJunction( helper.mapService.findJunction( 2 ) );

	} );

} );

xdescribe( '1-Road-Roundabout', () => {

	let helper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

		helper.mapService.reset();

	} );

	it( 'should handle 1-road-circle & horizontal spline', () => {

		// TODO: Implement this test

		helper.addCircleSplineV2( 50 );

		const horizontal = helper.createStraightSpline( new Vector3( -50, 0, 0 ) );

		helper.splineService.add( horizontal );

		expectTJunction( helper.mapService.findJunction( 1 ) );

		expectValidMap( helper.mapService );

	} );

} );
