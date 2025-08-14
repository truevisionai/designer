import { TestBed } from "@angular/core/testing";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { setupTest, validateMap } from "tests/setup-tests";
import { expectTJunction, expectXJunction } from "tests/expect-junction.spec";
import { expectInstances } from "tests/expect-spline.spec";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { expectLinkedConnections } from "tests/base-test.spec";

describe( 'H-Junction Tests', () => {

	let helper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );

	} );

	afterEach( () => {

		validateMap( mapService.map );

	} );

	function expectCorrectSegments ( splines: any ) {

		expectInstances( splines.horizontal, [ TvRoad, TvJunction, TvRoad, TvJunction, TvRoad ] );
		expectInstances( splines.verticalLeft, [ TvRoad, TvJunction, TvRoad ] );
		expectInstances( splines.verticalRight, [ TvRoad, TvJunction, TvRoad ] );

	}

	function expectCorrectElements () {

		expect( mapService.getJunctionCount() ).toBe( 2 );

		expect( mapService.map.getJunctions()[ 0 ] ).toBeDefined();
		expect( mapService.map.getJunctions()[ 1 ] ).toBeDefined();

		expectXJunction( mapService.map.getJunctions()[ 0 ] );
		expectXJunction( mapService.map.getJunctions()[ 1 ] );

		expect( mapService.nonJunctionRoads.length ).toBe( 7 );

	}

	it( 'should have correct segments', () => {

		const splines = helper.createHShapeWithXJunctions();

		expectCorrectSegments( splines );

	} );

	it( 'should create simple h-junction with 3 roads', () => {

		helper.createHShapeWithXJunctions();

		expectCorrectElements();

	} );

	it( 'every non-junction roads to have junction connections', () => {

		helper.createHShapeWithXJunctions();

		mapService.nonJunctionRoads.forEach( road => {

			expectLinkedConnections( road );

		} );

	} );


	it( 'should handle simple horizontal spline update', () => {

		const splines = helper.createHShapeWithXJunctions();

		helper.splineService.update( splines.horizontal );

		expectCorrectElements();

		expectCorrectSegments( splines );

	} );


	it( 'should have same segments after big horizontal spline update', () => {

		const splines = helper.createHShapeWithXJunctions();

		splines.horizontal.getControlPoints().forEach( point => {
			point.position.y += 50;
		} )

		helper.splineService.update( splines.horizontal );

		expectCorrectElements();

		expectCorrectSegments( splines );

	} );


	it( 'should handle H shape to TT shape conversion', () => {

		// horizontal spline will be moved to the top
		// which will create two T-junction on the top

		const splines = helper.createHShapeWithXJunctions();

		splines.horizontal.getControlPoints().forEach( point => {
			point.position.y += 100;
		} )

		helper.splineService.update( splines.horizontal );

		expectInstances( splines.horizontal, [ TvRoad, TvJunction, TvRoad, TvJunction, TvRoad ] );
		expectInstances( splines.verticalLeft, [ TvRoad, TvJunction ] );
		expectInstances( splines.verticalRight, [ TvRoad, TvJunction ] );

		expect( mapService.getJunctionCount() ).toBe( 2 );
		expect( mapService.getNonJunctionRoadCount() ).toBe( 5 );

		expectTJunction( mapService.map.getJunctions()[ 0 ] );
		expectTJunction( mapService.map.getJunctions()[ 1 ] );

	} );


} );
