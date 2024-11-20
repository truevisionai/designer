import { RoadService } from "../app/services/road/road.service";
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
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";

describe( 'BaseTest: tests', () => {

	let tool: RoadTool;

	let mapService: MapService;
	let roadService: RoadService;
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


} );
