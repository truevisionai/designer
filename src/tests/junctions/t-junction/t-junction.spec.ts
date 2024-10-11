import { TestBed } from "@angular/core/testing";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { expectValidMap } from "../../base-test.spec";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { setupTest } from "tests/setup-tests";
import { expectTJunction } from "tests/expect-junction.spec";

describe( 'T-Junction', () => {

	let splineTestHelper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		splineTestHelper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );

		AbstractSpline.reset();

	} );

	afterEach( () => {

		expectValidMap( mapService );

	} );

	it( 'should have splines with correct length', () => {

		const splines = splineTestHelper.createDoubleTJunctionWith3Roads();

		expect( splines.horizontal.getLength() ).toBeCloseTo( 300 );
		expect( splines.verticalLeft.getLength() ).toBeCloseTo( 100 );
		expect( splines.verticalRight.getLength() ).toBeCloseTo( 100 );

	} );

	it( 'should create one t-junction from 2 roads', () => {

		splineTestHelper.createSimpleTJunction();

		expect( mapService.getJunctionCount() ).toBe( 1 );

		expectTJunction( mapService.findJunction( 1 ) );

	} );

	it( 'should create one t-junction from 3 roads', async () => {

		await splineTestHelper.createTJunctionWith3Roads();

		expect( mapService.getJunctionCount() ).toBe( 1 );

		expectTJunction( mapService.findJunction( 1 ) );

	} );

	it( 'should create two t-junctions from 3 roads', () => {

		splineTestHelper.createDoubleTJunctionWith3Roads();

		expect( mapService.getJunctionCount() ).toBe( 2 );

		expectTJunction( mapService.findJunction( 1 ) );
		expectTJunction( mapService.findJunction( 2 ) );

	} );

	it( 'should should remove junctions when spline is moved too far', () => {

		const splines = splineTestHelper.createDoubleTJunctionWith3Roads();

		expect( mapService.getJunctionCount() ).toBe( 2 );

		// move the horizontal spline up by 100
		splines.horizontal.controlPoints.forEach( point => point.position.y += 100 );

		// this step should remove all the junctions
		splineTestHelper.splineService.update( splines.horizontal );

		expect( mapService.getJunctionCount() ).toBe( 0 );


	} );

} );
