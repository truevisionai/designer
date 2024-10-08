import { TestBed } from '@angular/core/testing';
import { MapService } from 'app/services/map/map.service';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { Vector3 } from 'three';
import { setupTest, expectValidMap, expectValidRoad } from 'tests/setup-tests';

describe( 'CircleJunctionTest', () => {

	let mapService: MapService;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		mapService = TestBed.get( MapService );
		testHelper = TestBed.get( SplineTestHelper );

	} );

	it( 'should create simple connections through a circular road', () => {

		testHelper.addCircleRoad( 50 );
		testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

	} )

	it( 'should pass validations when spline is removed', () => {

		testHelper.addCircleRoad( 50 );

		expect( mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		testHelper.splineService.remove( horizontal.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 0 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( mapService.map );

		expect( mapService.map.getRoadCount() ).toBe( 6 );

	} )

	xit( 'should pass validations when spline is moved', () => {

		// TODO: Implement this test

		testHelper.addCircleRoad( 50 );

		expect( mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		testHelper.splineService.update( horizontal.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expectValidRoad( road );
		} );

		expectValidMap( mapService.map );

		expect( mapService.map.getRoadCount() ).toBe( 6 );

	} );

} );
