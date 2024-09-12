import { HttpClientModule } from "@angular/common/http";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CROSSING8_XODR, SplineTestHelper, TOWN_01 } from "app/services/spline/spline-test-helper.service";
import { TvJunctionInnerBoundaryService } from "./tv-junction-inner-boundary.service";
import { TvJointBoundary, TvJunctionBoundary, TvLaneBoundary } from "./tv-junction-boundary";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { TvJunctionOuterBoundaryService } from "./tv-junction-outer-boundary.service";

describe( 'TvJunctionInnerBoundaryService', () => {

	let testHelper: SplineTestHelper;
	let service: TvJunctionInnerBoundaryService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		testHelper = TestBed.inject( SplineTestHelper );

		TestBed.inject( EventServiceProvider ).init();

		service = TestBed.inject( TvJunctionInnerBoundaryService );

	} );

	it( 'should create inner boundary for junction between 2 roads', () => {

		const junction = testHelper.addCustomJunctionWith2Roads();

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 4 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );

	} );

	it( 'should create inner boundary for 4-way-junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 8 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 7 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create inner boundary for t-junction', fakeAsync( () => {

		testHelper.createSimpleTJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 6 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create inner boundary import junction', async () => {

		const map = await testHelper.loadAndParseXodr( CROSSING8_XODR );

		const junction = map.getJunctions()[ 0 ];

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( junction.getConnectionCount() ).toBe( 12 );
		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} );

	it( 'should create inner boundary import junction new', async () => {

		const map = await testHelper.loadAndParseXodr( TOWN_01 );

		const junction = map.getJunctionById( 184 );

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( junction.getConnectionCount() ).toBe( 6 );
		expect( boundary.getSegmentCount() ).toBe( 7 );

		expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvLaneBoundary );
		expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvJointBoundary );
		expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvLaneBoundary );

	} );


} )

describe( 'TvJunctionOuterBoundaryService', () => {

	let testHelper: SplineTestHelper;
	let service: TvJunctionOuterBoundaryService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		testHelper = TestBed.inject( SplineTestHelper );

		TestBed.inject( EventServiceProvider ).init();

		service = TestBed.inject( TvJunctionOuterBoundaryService );

	} );

	it( 'should create outer boundary for junction between 2 roads', () => {

		const junction = testHelper.addCustomJunctionWith2Roads();

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 4 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );

	} );

	it( 'should create outer boundary for 4-way-junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 6 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 7 ] ).toBeInstanceOf( TvJointBoundary );

	} ) );

	it( 'should create outer boundary for t-junction', fakeAsync( () => {

		testHelper.createSimpleTJunction();

		tick( 1000 );

		const junction = testHelper.mapService.findJunction( 1 );

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( boundary.getSegmentCount() ).toBe( 6 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} ) );

	it( 'should create outer boundary crossing 8 xodr', async () => {

		const map = await testHelper.loadAndParseXodr( CROSSING8_XODR );

		const junction = map.getJunctions()[ 0 ];

		const boundary = new TvJunctionBoundary();

		service.update( junction, boundary );

		expect( junction.getConnectionCount() ).toBe( 12 );
		expect( boundary.getSegmentCount() ).toBe( 8 );

		// expect( boundary.getSegments()[ 0 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 1 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 2 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 3 ] ).toBeInstanceOf( TvLaneBoundary );
		// expect( boundary.getSegments()[ 4 ] ).toBeInstanceOf( TvJointBoundary );
		// expect( boundary.getSegments()[ 5 ] ).toBeInstanceOf( TvLaneBoundary );

	} );


} )

