import { HttpClientModule } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { JunctionManager } from "app/managers/junction-manager";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { JunctionUtils } from "app/utils/junction.utils";
import { expectValidMap } from "../../base-test.spec";
import { AbstractSpline } from "app/core/shapes/abstract-spline";

describe( 'T-Junction Tests', () => {

	let splineTestHelper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;
	let mapService: MapService;
	let junctionManager: JunctionManager;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		mapService = TestBed.inject( MapService );
		junctionManager = TestBed.inject( JunctionManager );

		eventServiceProvider.init();

	} );

	it( 't-junction of 2 roads should have 12 links', fakeAsync( () => {

		splineTestHelper.createSimpleTJunction();

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 12 );

		expectValidMap( mapService );

	} ) );

	it( 't-junction of 3 roads should have 12 links', fakeAsync( () => {

		splineTestHelper.createTJunctionWith3Roads();

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 12 );

		expectValidMap( mapService );

	} ) );

	it( 'double t-junction of 3 roads should have 12 links each', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.createDoubleTJunctionWith3Roads();

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 2 );

		expect( mapService.findJunction( 1 ).getLaneLinkCount() ).toBe( 12 );
		expect( mapService.findJunction( 2 ).getLaneLinkCount() ).toBe( 12 );

		expect( mapService.findSplineById( 1 ).getLength() ).toBeCloseTo( 300 );
		expect( mapService.findSplineById( 2 ).getLength() ).toBeCloseTo( 100 );
		expect( mapService.findSplineById( 3 ).getLength() ).toBeCloseTo( 100 );

		expectValidMap( mapService );

	} ) );

	it( 'should handle remove all junctions for double t-junction when road is moved', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.createDoubleTJunctionWith3Roads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 2 );

		const spline = splineTestHelper.splineService.findById( 1 );			// move the horizontal spline up by 100

		spline.controlPoints.forEach( point => point.position.y += 100 );

		splineTestHelper.splineService.update( spline );						// this step should remove all the junctions

		expect( mapService.junctions.length ).toBe( 0 );
		expect( mapService.findSplineById( 1 ).getLength() ).toBeCloseTo( 300 );
		expect( mapService.findSplineById( 2 ).getLength() ).toBeCloseTo( 100 );
		expect( mapService.findSplineById( 3 ).getLength() ).toBeCloseTo( 100 );

		expectValidMap( mapService );

	} ) );

} );
