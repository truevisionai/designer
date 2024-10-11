import { TestBed } from "@angular/core/testing";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { setupTest, validateMap } from "tests/setup-tests";
import { expectXJunction } from "tests/expect-junction.spec";
import { expectInstances } from "tests/expect-spline.spec";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { expectLinkedConnections } from "tests/base-test.spec";

describe( 'H-Junction Tests', () => {

	let helper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( async () => {

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

		expect( mapService.findJunction( 1 ) ).toBeDefined();
		expect( mapService.findJunction( 2 ) ).toBeDefined();

		expectXJunction( mapService.findJunction( 1 ) );
		expectXJunction( mapService.findJunction( 2 ) );

		expect( mapService.nonJunctionRoads.length ).toBe( 7 );

	}

	it( 'should have correct segments', async () => {

		const splines = helper.createHShapeWithXJunctions();

		expectCorrectSegments( splines );

	} );

	it( 'should create simple h-junction with 3 roads', async () => {

		helper.createHShapeWithXJunctions();

		expectCorrectElements();

	} );

	it( 'every non-junction roads to have junction connections', async () => {

		helper.createHShapeWithXJunctions();

		mapService.nonJunctionRoads.forEach( road => {

			expectLinkedConnections( road );

		} );

	} );


	it( 'should handle simple horizontal spline update', async () => {

		const splines = helper.createHShapeWithXJunctions();

		helper.splineService.update( splines.horizontal );

		expectCorrectElements();

		expectCorrectSegments( splines );

	} );


	it( 'should have same segments after big horizontal spline update', async () => {

		const splines = helper.createHShapeWithXJunctions();

		splines.horizontal.getControlPoints().forEach( point => {
			point.position.y += 50;
		} )

		helper.splineService.update( splines.horizontal );

		expectCorrectElements();

		expectCorrectSegments( splines );

	} );


} );
