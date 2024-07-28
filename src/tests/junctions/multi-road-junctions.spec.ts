import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BaseTest } from "../base-test.spec";
import { MapService } from "../../app/services/map/map.service";
import { RoadService } from "../../app/services/road/road.service";
import { EventServiceProvider } from "../../app/listeners/event-service-provider";
import { RoadToolHelper } from "../../app/tools/road/road-tool-helper.service";
import { Vector2 } from "three";
import { JunctionManager } from "../../app/managers/junction-manager";

xdescribe( 'Multi-RoadJunctionTests', () => {

	let baseTest = new BaseTest();
	let mapService: MapService;
	let roadService: RoadService;
	let eventServiceProvider: EventServiceProvider;
	let roadToolService: RoadToolHelper;
	let junctionManager: JunctionManager;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolHelper ]
		} );

		roadToolService = TestBed.inject( RoadToolHelper );
		roadService = roadToolService.roadService;

		mapService = TestBed.inject( MapService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

		junctionManager = TestBed.inject( JunctionManager );

	} );

	it( 'should create a group with 3 roads', () => {

		const horiztonal = baseTest.createDefaultRoad( roadService, [ new Vector2( -50, 0 ), new Vector2( 50, 0 ) ] )
		const vertical = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -50 ), new Vector2( 0, 50 ) ] )
		const diagonal = baseTest.createDefaultRoad( roadService, [ new Vector2( -50, -50 ), new Vector2( 50, 50 ) ] )

		junctionManager.updateJunctions( horiztonal.spline );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.findJunction( 1 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 30 );

	} );

} );
