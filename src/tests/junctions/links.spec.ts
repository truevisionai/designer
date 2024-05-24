import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RoadFactory } from 'app/factories/road-factory.service';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { ConnectionService } from 'app/map/junction/connection/connection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { LaneLinkService } from 'app/services/junction/lane-link.service';
import { MapService } from 'app/services/map/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { BaseTest } from "tests/base-test.spec";
import { Vector2, Vector3 } from 'three';

describe( 'LaneLinkService', () => {

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let laneLinkService: LaneLinkService;
	let connectionService: ConnectionService;
	let baseTest = new BaseTest();
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolService ]
		} );

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		laneLinkService = TestBed.inject( LaneLinkService );
		connectionService = TestBed.inject( ConnectionService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	it( 'should create simple junction between same roads', () => {

		// left to right
		const roadA = baseTest.createDefaultRoad( roadService, [
			new Vector2( -50, 0 ),
			new Vector2( 100, 0 ),
		] );

		const coordA = roadA.getPosThetaAt( 50 ).toRoadCoord( roadA );
		const coordB = roadA.getPosThetaAt( 100 ).toRoadCoord( roadA );

		const junction = intersectionService.createIntersectionByContact(
			coordA,
			TvContactPoint.END,
			coordB,
			TvContactPoint.START
		);

		junctionService.addJunction( junction );

		expect( roadService.getRoadCount() ).toBe( 4 );
		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );

		const roadB = roadService.getRoad( 2 );
		const leftToRight = roadService.getRoad( 3 );
		const rightToLeft = roadService.getRoad( 4 );


		expect( junction.connections.get( 0 ) ).toBeDefined()
		expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( roadA.id )
		expect( junction.connections.get( 0 ).connectingRoad.id ).toBe( leftToRight.id )
		expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( roadB.id )
		expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		expect( leftToRight.laneSections[ 0 ].lanes.size ).toBe( 4 );
		baseTest.expectCorrectLaneOrder( leftToRight.laneSections[ 0 ] );

		expect( junction.connections.get( 1 ) ).toBeDefined()
		expect( junction.connections.get( 1 ).incomingRoad ).toBe( roadB )
		expect( junction.connections.get( 1 ).connectingRoad ).toBe( rightToLeft )
		expect( junction.connections.get( 1 ).outgoingRoad ).toBe( roadA )
		expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

		expect( rightToLeft.laneSections[ 0 ].lanes.size ).toBe( 4 );
		baseTest.expectCorrectLaneOrder( rightToLeft.laneSections[ 0 ] );

	} )

	it( 'should make links between 6 lane road and 6 lane road ', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		xAxisRoad.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.addControlPointAt( new Vector3( 10, 0, 0 ) );
		yAxisRoad.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		roadService.add( xAxisRoad );
		roadService.add( yAxisRoad );

		const junction = junctionService.createNewJunction();

		const incoming = xAxisRoad.getEndPosTheta().toRoadCoord( xAxisRoad );
		const outgoing = yAxisRoad.getStartPosTheta().toRoadCoord( yAxisRoad );

		const leftToRightConnection = connectionService.createConnection( junction, incoming, outgoing );
		expect( leftToRightConnection ).toBeDefined();
		expect( leftToRightConnection.laneLink.length ).toBe( 2 );

		// const rightToLeftConnection = connectionService.createConnection( junction, outgoing, incoming );
		// expect( rightToLeftConnection ).toBeDefined();
		// expect( rightToLeftConnection.laneLink.length ).toBe( 1 );

	} );

	it( 'should make links between 4 lane road and 2 lane road opposite contacts', () => {

		const left = baseTest.createRoad( roadService, [
			new Vector2( -50, 0 ),
			new Vector2( 0, 0 )
		], 2, 2 );

		const right = baseTest.createRoad( roadService, [
			new Vector2( 10, 0 ),
			new Vector2( 50, 0 )
		], 1, 1 );

		const junction = junctionService.createNewJunction();

		const incoming = left.getEndPosTheta().toRoadCoord( left );
		const outgoing = right.getStartPosTheta().toRoadCoord( right );

		const leftToRight = connectionService.createConnection( junction, incoming, outgoing );
		expect( leftToRight ).toBeDefined();
		expect( leftToRight.laneLink.length ).toBe( 2 );
		expect( leftToRight.laneLink[ 0 ].incomingLane.id ).toBe( -1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.id ).toBe( -1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.predecessor ).toBe( -1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.succcessor ).toBe( -1 );

		const rightToLeft = connectionService.createConnection( junction, outgoing, incoming );
		expect( rightToLeft ).toBeDefined();
		expect( rightToLeft.laneLink.length ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].incomingLane.id ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.id ).toBe( -1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.predecessor ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.succcessor ).toBe( 1 );

	} );

	it( 'should make links with correct lane width 1', () => {

		const left = baseTest.createRoad( roadService, [
			new Vector2( -50, 0 ),
			new Vector2( 0, 0 )
		], 1, 1, 1, 1 );

		const right = baseTest.createRoad( roadService, [
			new Vector2( 10, 0 ),
			new Vector2( 50, 0 )
		], 1, 1, 1, 1 );

		const junction = junctionService.createNewJunction();

		const incoming = left.getEndPosTheta().toRoadCoord( left );
		const outgoing = right.getStartPosTheta().toRoadCoord( right );

		const leftToRight = connectionService.createConnection( junction, incoming, outgoing );

		const roadLength = leftToRight.connectingRoad.length;

		expect( leftToRight ).toBeDefined();
		expect( leftToRight.laneLink.length ).toBe( 1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.getWidthValue( 0 ) ).toBe( 1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.getWidthValue( roadLength ) ).toBe( 1 );

		const rightToLeft = connectionService.createConnection( junction, outgoing, incoming );

		expect( rightToLeft ).toBeDefined();
		expect( rightToLeft.laneLink.length ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.getWidthValue( 0 ) ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.getWidthValue( roadLength ) ).toBe( 1 );


	} );

	it( 'should make links with correct lane width 2', () => {

		const left = baseTest.createRoad( roadService, [
			new Vector2( -50, 0 ),
			new Vector2( 0, 0 )
		], 1, 1, 1, 1 );

		const right = baseTest.createRoad( roadService, [
			new Vector2( 10, 0 ),
			new Vector2( 50, 0 )
		], 1, 1, 1, 2 );

		const junction = junctionService.createNewJunction();

		const incoming = left.getEndPosTheta().toRoadCoord( left );
		const outgoing = right.getStartPosTheta().toRoadCoord( right );

		const leftToRight = connectionService.createConnection( junction, incoming, outgoing );

		const roadLength = leftToRight.connectingRoad.length;

		expect( leftToRight ).toBeDefined();
		expect( leftToRight.laneLink.length ).toBe( 1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.getWidthValue( 0 ) ).toBe( 1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.getWidthValue( roadLength ) ).toBe( 2 );


	} );


} );
