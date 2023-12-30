import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { MapService } from 'app/services/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { SplineEventListener } from "../../app/listeners/spline-event-listener";
import { RoadEventListener } from 'app/listeners/road-event-listener';
import { BaseTest } from "tests/base-test.spec";
import { JunctionEventListener } from 'app/listeners/junction-event.listener';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineRemovedEvent } from "../../app/events/spline/spline-removed-event";

describe( 'AutoSpline Tests', () => {

	let tool: RoadTool;

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let baseTest = new BaseTest();

	let eventServiceProvider: EventServiceProvider

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	it( 'should reset road when spline is removed from junction', () => {

		baseTest.createFourWayJunction( roadService, intersectionService );

		const roadA = roadService.getRoad( 1 );
		const roadB = roadService.getRoad( 2 );

		tool.onSplineRemoved( roadB.spline );

		expect( mapService.map.getJunctionCount() ).toBe( 0 );
		expect( mapService.map.getRoadCount() ).toBe( 1 );
		expect( mapService.map.getSplineCount() ).toBe( 1 );

		expect( roadA.getRoadLength() ).toBe( 200 );
		expect( roadA.successor ).toBeNull();
		expect( roadA.predecessor ).toBeUndefined();

	} );


} );
