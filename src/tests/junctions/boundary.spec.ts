import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { TvJunctionBoundaryFactory } from "app/map/junction-boundary/tv-junction-boundary.factory";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { setupTest } from "../setup-tests";


describe( 'JunctionBoundary Tests', () => {

	let splineTestHelper: SplineTestHelper;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		splineTestHelper = TestBed.inject( SplineTestHelper );
		mapService = TestBed.inject( MapService );

	} );

	it( 'should create inner boundary for default junction', fakeAsync( () => {

		splineTestHelper.addDefaultJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.getSegmentCount() ).toBe( 8 );

	} ) );

	it( 'should create inner boundary for t-junction', fakeAsync( () => {

		splineTestHelper.createSimpleTJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.getSegmentCount() ).toBe( 6 );

	} ) );

	it( 'should create inner boundary for star-junction', fakeAsync( () => {

		splineTestHelper.addSixRoadJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.getSegmentCount() ).toBe( 12 );

	} ) );

	it( 'should create inner boundary for angled 2 road junction', fakeAsync( () => {

		splineTestHelper.createAngleT2RoadJunction();

		tick( 1000 );

		const J1 = mapService.findJunction( 1 );

		expect( J1.getConnectionCount() ).toBe( 2 );

		const innerBoundary = TvJunctionBoundaryFactory.createInnerBoundary( J1 );
		expect( innerBoundary.getSegmentCount() ).toBe( 4 );

		const outerBoundary = TvJunctionBoundaryFactory.createOuterBoundary( J1 );
		expect( outerBoundary.getSegmentCount() ).toBe( 4 );

	} ) );

} );
