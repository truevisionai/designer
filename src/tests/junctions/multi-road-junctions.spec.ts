import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BaseTest } from "../base-test.spec";
import { MapService } from "../../app/services/map/map.service";
import { RoadService } from "../../app/services/road/road.service";
import { IntersectionService } from "../../app/services/junction/intersection.service";
import { JunctionService } from "../../app/services/junction/junction.service";
import { EventServiceProvider } from "../../app/listeners/event-service-provider";
import { SplineEventListener } from "../../app/listeners/spline-event-listener";
import { RoadToolService } from "../../app/tools/road/road-tool.service";
import { SplineManager } from "../../app/managers/spline-manager";
import { MapValidatorService } from "../../app/services/map/map-validator.service";
import { IntersectionManager } from "../../app/managers/intersection-manager";
import { Vector2 } from "three";

const DEFAULT_ROAD_WIDTH = 12.2;

fdescribe( 'Multi-RoadJunctionTests', () => {

	let baseTest = new BaseTest();
	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let eventServiceProvider: EventServiceProvider;
	let splineEventListener: SplineEventListener;
	let roadToolService: RoadToolService;
	let splineManager: SplineManager;
	let mapValidator: MapValidatorService;
	let intersectionManager: IntersectionManager;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolService ]
		} );

		roadToolService = TestBed.inject( RoadToolService );
		roadService = roadToolService.roadService;
		splineManager = TestBed.inject( SplineManager );
		intersectionManager = TestBed.inject( IntersectionManager );

		mapService = TestBed.inject( MapService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		splineEventListener = TestBed.inject( SplineEventListener );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

		mapValidator = TestBed.inject( MapValidatorService );

	} );

	it( 'should create a group with 3 roads', () => {

		const horiztonal = baseTest.createDefaultRoad( roadService, [ new Vector2( -50, 0 ), new Vector2( 50, 0 ) ] )
		const vertical = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -50 ), new Vector2( 0, 50 ) ] )
		const diagonal = baseTest.createDefaultRoad( roadService, [ new Vector2( -50, -50 ), new Vector2( 50, 50 ) ] )

		intersectionManager.updateIntersections( diagonal.spline );

		expect( mapService.junctions.length ).toBe( 1 );


	} );

} );
