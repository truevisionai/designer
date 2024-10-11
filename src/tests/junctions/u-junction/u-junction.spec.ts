import { TestBed } from "@angular/core/testing";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { setupTest, validateMap } from "tests/setup-tests";
import { expectTJunction, expectXJunction } from "tests/expect-junction.spec";
import { expectInstances } from "tests/expect-spline.spec";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { expectLinkedConnections } from "tests/base-test.spec";
import { Vector3 } from "three";

describe( 'U-Junction', () => {

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
		expectInstances( splines.spline, [ TvRoad, TvJunction, TvRoad, TvJunction, TvRoad ] );

	}

	function expectCorrectElements () {

		expect( mapService.getJunctionCount() ).toBe( 2 );

		expect( mapService.findJunction( 1 ) ).toBeDefined();
		expect( mapService.findJunction( 2 ) ).toBeDefined();

		expectXJunction( mapService.findJunction( 1 ) );
		expectXJunction( mapService.findJunction( 2 ) );

		expect( mapService.nonJunctionRoads.length ).toBe( 6 );

	}

	function createUShapeAndHoriztonalSpline () {

		const uShape = helper.createUShape();

		const horizontal = helper.addStraightRoadSpline( new Vector3( -100, 0, 0, ), 200 );

		return { horizontal, spline: uShape };

	}

	it( 'should detect 2 intersections', () => {

		const splines = createUShapeAndHoriztonalSpline();

		const intersections = splines.horizontal.getIntersections( splines.spline );

		expect( intersections.length ).toBe( 2 );

	} );

	it( 'should create correct segments', () => {

		const splines = createUShapeAndHoriztonalSpline();

		expectCorrectSegments( splines );

	} );

	it( 'should create 2 x-junctions with 1 horiztonal spline', () => {

		createUShapeAndHoriztonalSpline();

		expectCorrectElements();

	} );

	it( 'should handle minor update to horizontal spline', () => {

		const splines = createUShapeAndHoriztonalSpline();

		helper.splineService.update( splines.horizontal );

		expectCorrectElements();

	} );

	xit( 'should remove keep 1 x-junction and 1 junction when shifted right', () => {

	} );

	xit( 'should create remove 1 junction and create t-junction junction when shifted right', () => {

	} );

	xit( 'should create 2 t-junctions when shifted up', () => {

	} );

	xit( 'should remove junctions when shifted away from U shape', () => {

	} );


} );
