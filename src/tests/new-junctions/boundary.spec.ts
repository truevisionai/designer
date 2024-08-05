import { HttpClientModule } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { JunctionManager } from "app/managers/junction-manager";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";
import { TvJunctionBoundaryFactory } from "app/map/junction-boundary/tv-junction-boundary.factory";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";


describe( 'JunctionBoundary Tests', () => {

	let splineTestHelper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;
	let mapService: MapService;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		mapService = TestBed.inject( MapService );

		eventServiceProvider.init();

	} );

	it( 'should create inner boundary for default junction', fakeAsync( () => {

		splineTestHelper.addDefaultJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.segments.length ).toBe( 8 );

	} ) );

	it( 'should create inner boundary for t-junction', fakeAsync( () => {

		splineTestHelper.createSimpleTJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.segments.length ).toBe( 6 );

	} ) );

	it( 'should create inner boundary for star-junction', fakeAsync( () => {

		splineTestHelper.addSixRoadJunction();

		tick( 1000 );

		const boundary = TvJunctionBoundaryFactory.createInnerBoundary( mapService.findJunction( 1 ) );

		expect( boundary.segments.length ).toBe( 12 );

	} ) );

	it( 'should create inner boundary for angled 2 road junction', fakeAsync( () => {

		splineTestHelper.createAngleT2RoadJunction();

		tick( 1000 );

		const J1 = mapService.findJunction( 1 );

		expect( J1.getConnectionCount() ).toBe( 6 );

		const innerBoundary = TvJunctionBoundaryFactory.createInnerBoundary( J1 );
		expect( innerBoundary.segments.length ).toBe( 4 );

		const outerBoundary = TvJunctionBoundaryFactory.createOuterBoundary( J1 );
		expect( outerBoundary.segments.length ).toBe( 4 );

	} ) );

} );
