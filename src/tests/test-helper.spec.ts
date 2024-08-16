import { RoadService } from "../app/services/road/road.service";
import { IntersectionService } from "app/services/junction/intersection.service";
import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { DepConnectionFactory } from "app/map/junction/dep-connection.factory";
import { JunctionService } from "app/services/junction/junction.service";
import { MapService } from "app/services/map/map.service";
import { RoadTool } from "app/tools/road/road-tool";
import { RoadToolHelper } from "app/tools/road/road-tool-helper.service";
import { BaseTest } from "./base-test.spec";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";

describe( 'BaseTest: tests', () => {

	let tool: RoadTool;

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let junctionConnectionService: DepConnectionFactory;
	let baseTest = new BaseTest();
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolHelper ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolHelper ) )

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		junctionConnectionService = TestBed.inject( DepConnectionFactory );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

		disableMeshBuilding();

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	xit( 'should create 4 way junction correctly', () => {

		expect( roadService.roads.length ).toBe( 0 );
		expect( roadService.junctionRoads.length ).toBe( 0 );

		baseTest.createFourWayJunction( roadService, intersectionService );

		const roadA = roadService.getRoad( 1 );
		const roadB = roadService.getRoad( 2 );
		const roadC = roadService.getRoad( 3 );
		const roadD = roadService.getRoad( 4 );

		const junction = junctionService.getJunctionById( 1 );

		expect( roadService.roads.length ).toBe( 4 + 12 );

		expect( roadService.junctionRoads.length ).toBe( 12 );

		expect( junctionService.junctions.length ).toBe( 1 );

		expect( junctionConnectionService.connections.length ).toBe( 12 );

		expect( mapService.map.getSplineCount() ).toBe( 2 + 12 );

		// TODO: below are failing
		// expect( roadA.spline.uuid ).not.toBe( roadB.spline.uuid );
		// expect( roadA.spline.uuid ).toBe( roadD.spline.uuid );
		// expect( roadB.spline.uuid ).toBe( roadC.spline.uuid );

		expect( roadA.spline.getLength() ).toBe( 200 );
		expect( roadB.spline.getLength() ).toBe( 200 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 12 );

	} );

	xit( 'should create t-junction correctly', () => {

		expect( roadService.roads.length ).toBe( 0 );
		expect( roadService.junctionRoads.length ).toBe( 0 );

		baseTest.createTJunction( roadService, intersectionService );

		const roadA = roadService.getRoad( 1 );
		const roadB = roadService.getRoad( 2 );
		const roadC = roadService.getRoad( 3 );

		const junction = junctionService.getJunctionById( 1 );

		expect( roadService.roads.length ).toBe( 3 + 6 );

		expect( roadService.nonJunctionRoads.length ).toBe( 3 );
		expect( roadService.junctionRoads.length ).toBe( 6 );

		expect( junctionService.junctions.length ).toBe( 1 );

		expect( junctionConnectionService.connections.length ).toBe( 6 );

		expect( mapService.map.getSplineCount() ).toBe( 2 + 6 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 6 );

	} );


} );
