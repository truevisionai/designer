import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { JunctionUtils } from "app/utils/junction.utils";
import { Vector2 } from "three";
import { expectValidMap } from "../base-test.spec";
import { setupTest } from "tests/setup-tests";

describe( 'X-Junction Tests', () => {

	let helper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );

	} );

	it( 'should have 2 roads and 20 links', fakeAsync( () => {

		helper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 20 );

		expectValidMap( mapService );

	} ) );

	it( 'should handle removing road from x-junction of 2 roads', fakeAsync( () => {

		helper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const spline = mapService.getSplines()[ 0 ];

		helper.splineService.remove( spline );

		expect( mapService.getJunctionCount() ).toBe( 0 );

		expect( mapService.getRoadCount() ).toBe( 2 );
		expect( mapService.getSplineCount() ).toBe( 1 );

	} ) );

	it( 'should handle moving spline in 2-road-x-junction', fakeAsync( () => {

		helper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		const spline = mapService.getSplines()[ 0 ];

		helper.splineService.update( spline );

		expect( mapService.getJunctionCount() ).toBe( 1 );
		expect( mapService.getRoadCount() ).toBe( 4 + 20 );
		expect( mapService.getSplineCount() ).toBe( 2 + 20 );

	} ) );

	it( 'x-junction of 2 roads should squared junction', fakeAsync( () => {

		helper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const size = junction.boundingBox.getSize( new Vector2() );

		expect( size.x ).toBeCloseTo( size.y );

		expect( junction.containsPoint( new Vector2( junction.centroid.x, junction.centroid.y ) ) ).toBeTrue();

		expectValidMap( mapService );

	} ) );

	it( 'x-junction of 4 roads should have 20 links', fakeAsync( () => {

		helper.createXJunctionWithFourRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 20 );

		expectValidMap( mapService );

	} ) );

	xit( 'x-junction of 4 roads should have squared junction', fakeAsync( () => {

		helper.createXJunctionWithFourRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const size = junction.boundingBox.getSize( new Vector2() );

		expect( size.x ).toBeCloseTo( size.y );

		expect( junction.containsPoint( new Vector2( junction.centroid.x, junction.centroid.y ) ) ).toBeTrue();

		expectValidMap( mapService );

	} ) );


} );
