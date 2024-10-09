import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { Log } from "app/core/utils/log";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { Vector3 } from "three";
import { expectValidMap } from "../base-test.spec";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionUtils } from "app/utils/junction.utils";
import { expectValidRoad, setupTest, validateMap } from "tests/setup-tests";

describe( 'Circle-Road-Junction Tests', () => {

	let helper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );

	} );

	it( 'should handle 4-road-circle & horizontal spline', fakeAsync( () => {

		AbstractSpline.reset();

		helper.addCircleRoad( 50 );
		helper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		expect( mapService.junctions.length ).toBe( 2 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 12 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 2 ) ).length ).toBe( 12 );

		expectValidMap( mapService );

		validateMap( mapService.map );

	} ) );

	it( 'should handle 4-road-circle & horizontal spline movement', fakeAsync( () => {

		AbstractSpline.reset();

		helper.addCircleRoad( 50 );

		const horizontal = helper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		// move the horizontal spline to right by 50
		horizontal.controlPoints.forEach( point => point.position.x += 50 );

		helper.splineService.updateSpline( horizontal );

		expect( mapService.junctions.length ).toBe( 2 );

		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 20 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 2 ) ).length ).toBe( 6 );

		expectValidMap( mapService );

	} ) );

	it( 'should handle 4-road-circle & default junction', fakeAsync( () => {

		AbstractSpline.reset();

		Log.debug( 'should handle 4-road-circle & default junction' );

		helper.addCircleRoad( 50 );

		expect( mapService.junctions.length ).toBe( 0 );

		helper.addDefaultJunction();

		tick( 0 );

		expectValidMap( mapService );

		expect( mapService.junctions.length ).toBe( 2 );

		tick( 100 );

		expect( mapService.junctions.length ).toBe( 5 );

		mapService.junctions.forEach( junction => {
			if ( junction.id == 5 ) {
				expect( junction.getConnectionCount() ).toBe( 20 );
			} else {
				expect( junction.getConnectionCount() ).toBe( 12 );
			}
		} );

		expectValidMap( mapService );

	} ) );

	it( 'should handle 1-road-circle & horizontal spline', fakeAsync( () => {

		AbstractSpline.reset();

		helper.addCircleSplineV2( 50 );

		const horizontal = helper.createStraightSpline( new Vector3( -50, 0, 0 ) );

		helper.splineService.add( horizontal );

		expect( mapService.junctions.length ).toBe( 1 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 12 );
		expectValidMap( mapService );

	} ) );

	it( 'should create simple connections through a circular road', () => {

		helper.addCircleRoad( 50 );
		helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

	} )

	it( 'should pass validations when spline is removed', () => {

		helper.addCircleRoad( 50 );

		expect( mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		helper.splineService.remove( horizontal.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 0 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( mapService );

		expect( mapService.map.getRoadCount() ).toBe( 6 );

	} )

	xit( 'should pass validations when spline is moved', () => {

		// TODO: Implement this test

		helper.addCircleRoad( 50 );

		expect( mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = helper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		helper.splineService.update( horizontal.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( mapService );

		expect( mapService.map.getRoadCount() ).toBe( 6 );

	} );

} );
