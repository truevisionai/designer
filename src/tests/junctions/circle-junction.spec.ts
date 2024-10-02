import { TestBed } from '@angular/core/testing';
import { MapService } from 'app/services/map/map.service';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { RoadValidator } from 'app/managers/road/road-validator';
import { RoadLinkValidator } from 'app/managers/road/road-link-validator';
import { Vector3 } from 'three';
import { setupTest } from 'tests/setup-tests';
import { MapValidatorService } from 'app/services/map/map-validator.service';

describe( 'CircleJunctionTest', () => {

	let mapService: MapService;
	let testHelper: SplineTestHelper;
	let roadValidtor: RoadValidator;
	let roadLinkValidator: RoadLinkValidator;
	let mapValidator: MapValidatorService;

	beforeEach( () => {

		setupTest();

		mapValidator = TestBed.get( MapValidatorService );
		mapService = TestBed.get( MapService );
		testHelper = TestBed.get( SplineTestHelper );
		roadValidtor = TestBed.get( RoadValidator );
		roadLinkValidator = TestBed.get( RoadLinkValidator );

	} );

	it( 'should create simple connections through a circular road', () => {

		testHelper.addCircleRoad( 50 );
		testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expect( roadValidtor.validateRoad( road ) ).toBe( true, 'Road validation failed for road ' + road.id );
		} );

	} )

	it( 'should pass validations when spline is removed', () => {

		testHelper.addCircleRoad( 50 );

		expect( mapService.map.getRoadCount() ).toBe( 4 );

		const horizontal = testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		testHelper.splineService.remove( horizontal.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 0 );

		mapService.map.getRoads().forEach( road => {
			expect( roadValidtor.validateRoad( road ) ).toBe( true, 'Road validation failed for road ' + road.id );
		} );

		mapValidator.validateMap( mapService.map, true );

		expect( mapService.map.getRoadCount() ).toBe( 6 );

	} )

} );
