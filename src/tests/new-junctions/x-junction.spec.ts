import { HttpClientModule } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { JunctionManager } from "app/managers/junction-manager";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { JunctionUtils } from "app/utils/junction.utils";
import { Vector2 } from "three";
import { expectValidMap } from "../base-test.spec";

describe( 'X-Junction Tests', () => {

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

	it( 'x-junction of 2 roads should have 20 links', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 20 );

		expectValidMap( mapService );

	} ) );

	it( 'x-junction of 2 roads should squared junction', fakeAsync( () => {

		splineTestHelper.createXJunctionWithTwoRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const size = junction.boundingBox.getSize( new Vector2() );

		expect( size.x ).toBeCloseTo( size.y );

		expect( junction.boundingBox.containsPoint( new Vector2( junction.centroid.x, junction.centroid.y ) ) ).toBeTrue();

		expectValidMap( mapService );

	} ) );

	it( 'x-junction of 4 roads should have 20 links', fakeAsync( () => {

		splineTestHelper.createXJunctionWithFourRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const laneLinks = JunctionUtils.getLaneLinks( junction );

		expect( laneLinks.length ).toBe( 20 );

		expectValidMap( mapService );

	} ) );

	xit( 'x-junction of 4 roads should have squared junction', fakeAsync( () => {

		splineTestHelper.createXJunctionWithFourRoads( false );

		tick( 1000 );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		const size = junction.boundingBox.getSize( new Vector2() );

		expect( size.x ).toBeCloseTo( size.y );

		expect( junction.boundingBox.containsPoint( new Vector2( junction.centroid.x, junction.centroid.y ) ) ).toBeTrue();

		expectValidMap( mapService );

	} ) );


} );
