import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { MapService } from 'app/services/map/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadToolHelper } from 'app/tools/road/road-tool-helper.service';
import { Vector2, Vector3 } from 'three';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DepConnectionFactory } from 'app/map/junction/dep-connection.factory';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { BaseTest } from 'tests/base-test.spec';

xdescribe( 'LaneLinkService', () => {

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let connectionService: DepConnectionFactory;
	let eventServiceProvider: EventServiceProvider;
	let testHelper: SplineTestHelper;
	let baseTest = new BaseTest();

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolHelper ]
		} );

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		connectionService = TestBed.inject( DepConnectionFactory );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		testHelper = TestBed.inject( SplineTestHelper );

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
		const roadA = testHelper.createDefaultRoad( [
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
		expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		expect( leftToRight.laneSections[ 0 ].lanesMap.size ).toBe( 4 );
		expectCorrectLaneOrder( leftToRight.laneSections[ 0 ] );

		expect( junction.connections.get( 1 ) ).toBeDefined()
		expect( junction.connections.get( 1 ).incomingRoad ).toBe( roadB )
		expect( junction.connections.get( 1 ).connectingRoad ).toBe( rightToLeft )
		expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

		expect( rightToLeft.laneSections[ 0 ].lanesMap.size ).toBe( 4 );
		expectCorrectLaneOrder( rightToLeft.laneSections[ 0 ] );

	} )

	it( 'should make links between 6 lane road and 6 lane road ', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 10, 0, 0 ) ) );
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 50, 0, 0 ) ) );

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
		expect( leftToRight.laneLink[ 0 ].connectingLane.predecessorId ).toBe( -1 );
		expect( leftToRight.laneLink[ 0 ].connectingLane.successorId ).toBe( -1 );

		const rightToLeft = connectionService.createConnection( junction, outgoing, incoming );
		expect( rightToLeft ).toBeDefined();
		expect( rightToLeft.laneLink.length ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].incomingLane.id ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.id ).toBe( -1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.predecessorId ).toBe( 1 );
		expect( rightToLeft.laneLink[ 0 ].connectingLane.successorId ).toBe( 1 );

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
function expectCorrectLaneOrder ( arg0: TvLaneSection ) {
	throw new Error( 'Function not implemented.' );
}

