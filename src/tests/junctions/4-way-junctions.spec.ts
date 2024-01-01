import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { JunctionConnectionService } from 'app/services/junction/junction-connection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { MapService } from 'app/services/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { Vector3 } from 'three';
import { BaseTest } from 'tests/base-test.spec';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineControlPoint } from 'app/modules/three-js/objects/spline-control-point';

describe( '4-way-junction tests', () => {

	let tool: RoadTool;
	let baseTest = new BaseTest();

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let junctionConnectionService: JunctionConnectionService;

	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		junctionConnectionService = TestBed.inject( JunctionConnectionService );

		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	it( 'should create simple junction between 2 different roads', () => {

		// left to right
		const roadA = roadService.createDefaultRoad();
		roadA.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		roadA.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		// bottom to top
		const roadB = roadService.createDefaultRoad();
		roadB.spline.addControlPointAt( new Vector3( 0, 20, 0 ) );
		roadB.spline.addControlPointAt( new Vector3( 0, 70, 0 ) );

		roadService.addRoad( roadA );
		roadService.addRoad( roadB );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const junction = intersectionService.createIntersectionByContact(
			coordA,
			TvContactPoint.END,
			coordB,
			TvContactPoint.START
		);

		junctionService.addJunction( junction );

		expect( roadService.roads.length ).toBe( 4 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );

		expect( junction.connections.get( 0 ) ).toBeDefined()
		expect( junction.connections.get( 0 ).incomingRoad ).toBe( roadA );
		expect( junction.connections.get( 0 ).outgoingRoad ).toBe( roadB );
		expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		expect( junction.connections.get( 1 ) ).toBeDefined()
		expect( junction.connections.get( 1 ).incomingRoad ).toBe( roadB );
		expect( junction.connections.get( 1 ).outgoingRoad ).toBe( roadA );
		expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

	} )

	it( 'should create simple junction between same roads', () => {

		// left to right
		const roadA = roadService.createDefaultRoad();
		roadA.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		roadA.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		roadService.addRoad( roadA );

		const coordA = roadA.getPosThetaAt( 50 ).toRoadCoord( roadA );
		const coordB = roadA.getPosThetaAt( 100 ).toRoadCoord( roadA );

		const junction = intersectionService.createIntersectionByContact(
			coordA,
			TvContactPoint.END,
			coordB,
			TvContactPoint.START
		);

		junctionService.addJunction( junction );

		expect( roadService.roads.length ).toBe( 4 );

		// expect( junction ).toBeDefined();
		// expect( junction.connections.size ).toBe( 2 );

		// expect( junction.connections.get( 0 ) ).toBeDefined()
		// expect( junction.connections.get( 0 ).incomingRoad ).toBe( roadA );
		// expect( junction.connections.get( 0 ).outgoingRoad ).toBe( roadB );
		// expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		// expect( junction.connections.get( 1 ) ).toBeDefined()
		// expect( junction.connections.get( 1 ).incomingRoad ).toBe( roadB );
		// expect( junction.connections.get( 1 ).outgoingRoad ).toBe( roadA );
		// expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

	} )

	it( 'should create 4-way junction', () => {

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		road1.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		// bottom to top
		const road2 = roadService.createDefaultRoad();
		road2.spline.addControlPointAt( new Vector3( 0, -50, 0 ) );
		road2.spline.addControlPointAt( new Vector3( 0, 50, 0 ) );

		roadService.addRoad( road1 );
		roadService.addRoad( road2 );

		intersectionService.checkSplineIntersections( road2.spline );

		expect( junctionService.junctions.length ).toBe( 1 );

		const junction = junctionService.junctions[ 0 ];
		const connections = junction.getConnections();

		expect( junction.id ).toBe( 1 );
		expect( connections.length ).toBe( 12 );
		expect( roadService.roads.length ).toBe( 16 );

		// 1->left
		// 2->bottom
		// 3->top
		// 4->right
		const leftRoad = roadService.getRoad( 1 );
		const bottomRoad = roadService.getRoad( 2 );
		const topRoad = roadService.getRoad( 3 );
		const rightRoad = roadService.getRoad( 4 );

		expect( leftRoad.length ).toBeCloseTo( 37.8 );
		expect( bottomRoad.length ).toBeCloseTo( 37.8 );
		expect( rightRoad.length ).toBeCloseTo( 37.8 );
		expect( topRoad.length ).toBeCloseTo( 37.8 );

		expect( leftRoad.predecessor ).toBeUndefined();
		expect( bottomRoad.predecessor ).toBeUndefined();
		expect( rightRoad.successor ).toBeUndefined();
		expect( topRoad.successor ).toBeUndefined();

		expect( leftRoad.successor ).toBeDefined();
		expect( bottomRoad.successor ).toBeDefined();
		expect( rightRoad.predecessor ).toBeDefined();
		expect( topRoad.predecessor ).toBeDefined();

		expect( topRoad.predecessor.elementId ).toBe( junction.id );
		expect( leftRoad.successor.elementId ).toBe( junction.id );
		expect( bottomRoad.successor.elementId ).toBe( junction.id );
		expect( rightRoad.predecessor.elementId ).toBe( junction.id );

		for ( let i = 1; i <= 12; i++ ) {

			const road = roadService.getRoad( i );

			expect( road ).toBeDefined();
			expect( road.getPosThetaAt( 0 ) ).toBeDefined();

			if ( road.spline.controlPoints.length == 2 ) {

				expect( road.spline.controlPoints.length ).toBe( 2 );
				expect( road.geometries.length ).toBe( 1 );

			} else {

				expect( road.spline.controlPoints.length ).toBe( 4 );

			}

		}

		for ( let i = 0; i < connections.length; i++ ) {

			expect( junction.connections.get( i ) ).toBeDefined();
			expect( junction.connections.get( i ).connectingRoad.spline.controlPoints.length ).toBe( 4 );

		}

		expect( junction.connections.get( 0 ).connectingRoad.id ).toBe( 5 );
		expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( bottomRoad.id );
		expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( leftRoad.id );

		expect( junction.connections.get( 1 ).connectingRoad.id ).toBe( 6 );
		expect( junction.connections.get( 1 ).incomingRoad.id ).toBe( leftRoad.id );
		expect( junction.connections.get( 1 ).outgoingRoad.id ).toBe( bottomRoad.id );

		expect( junction.connections.get( 2 ).connectingRoad.id ).toBe( 7 );
		expect( junction.connections.get( 2 ).incomingRoad.id ).toBe( bottomRoad.id );
		expect( junction.connections.get( 2 ).outgoingRoad.id ).toBe( topRoad.id );

		expect( junction.connections.get( 3 ).connectingRoad.id ).toBe( 8 );
		expect( junction.connections.get( 3 ).incomingRoad.id ).toBe( topRoad.id );
		expect( junction.connections.get( 3 ).outgoingRoad.id ).toBe( bottomRoad.id );

		expect( junction.connections.get( 4 ).connectingRoad.id ).toBe( 9 );
		expect( junction.connections.get( 4 ).incomingRoad.id ).toBe( leftRoad.id );
		expect( junction.connections.get( 4 ).outgoingRoad.id ).toBe( topRoad.id );


	} );

	it( 'should rebuild junction after junction linked road is removed', () => {

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		road1.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		// bottom to top
		const road2 = roadService.createDefaultRoad();
		road2.spline.addControlPointAt( new Vector3( 0, -50, 0 ) );
		road2.spline.addControlPointAt( new Vector3( 0, 50, 0 ) );

		roadService.addRoad( road1 );
		roadService.addRoad( road2 );

		intersectionService.checkSplineIntersections( road2.spline );

		// 4 roads
		// 12 connections
		expect( roadService.roads.length ).toBe( 16 );
		expect( junctionService.junctions.length ).toBe( 1 );

		const junction = junctionService.junctions[ 0 ];

		expect( junction.connections.size ).toBe( 12 );

		// 1->left
		// 2->bottom
		// 3->top
		// 4->right
		const leftRoad = roadService.getRoad( 1 );
		const bottomRoad = roadService.getRoad( 2 );
		const topRoad = roadService.getRoad( 3 );
		const rightRoad = roadService.getRoad( 4 );

		tool.onRoadRemoved( bottomRoad );

		expect( roadService.roads.length ).toBe( 9 );
		expect( junction.connections.size ).toBe( 6 );

	} );

	it( 'should add non-driving lanes correctly', () => {

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		road1.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		const road3 = roadService.createDefaultRoad();
		road3.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );
		road3.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		roadService.addRoad( road1 );
		roadService.addRoad( road3 );

		const junction = junctionService.createNewJunction();

		const incoming = road1.getEndPosTheta().toRoadCoord( road1 );
		const outgoing = road3.getStartPosTheta().toRoadCoord( road3 );

		const connection = junctionConnectionService.createConnection( junction, incoming, outgoing );

		junction.addConnection( connection );

		junctionConnectionService.postProcessConnection( connection );

		expect( connection.laneLink.length ).toBe( 3 );

	} );

	it( 'should create 2 4-way junctions automatically', () => {

		expect( roadService.getRoadCount() ).toBe( 0 );

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.addControlPointAt( new Vector3( -100, 0, 0 ) );
		road1.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		// left to right
		const road2 = roadService.createDefaultRoad();
		road2.spline.addControlPointAt( new Vector3( -100, 50, 0 ) );
		road2.spline.addControlPointAt( new Vector3( 100, 50, 0 ) );

		// bottom to top
		const road3 = roadService.createDefaultRoad();
		road3.spline.addControlPointAt( new Vector3( 0, -200, 0 ) );
		road3.spline.addControlPointAt( new Vector3( 0, 200, 0 ) );

		roadService.addRoad( road1 );
		roadService.addRoad( road2 );
		roadService.addRoad( road3 );

		intersectionService.checkSplineIntersections( road3.spline );

		expect( junctionService.junctions.length ).toBe( 2 );
		// 12 for each junction
		expect( roadService.roads.filter( road => road.isJunction ).length ).toBe( 24 );
		expect( roadService.roads.filter( road => !road.isJunction ).length ).toBe( 7 );

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
		expect( roadA.predecessor ).toBeNull();

		expect( roadB.spline.getLength() ).toBe( 200 );
		expect( roadB.spline.getSplineSegments().length ).toBe( 0 );

	} );

	it( 'should reset when whole spline is moved away', () => {

		baseTest.createFourWayJunction( roadService, intersectionService );

		expect( mapService.map.getJunctionCount() ).toBe( 1 );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		vertical.spline.controlPoints.forEach( point => point.position.x += 300 );

		tool.onControlPointUpdated( vertical.spline.controlPoints[ 0 ] );

		const splines = mapService.map.getSplines();

		// FLAKY TEST
		// expect( splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
		expect( splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeDefined();

		expect( mapService.map.getJunctionCount() ).toBe( 0 );
		expect( mapService.map.getRoadCount() ).toBe( 2 );

		// FLAKY TEST
		// expect( mapService.map.getSplineCount() ).toBe( 2 );

		expect( horizontal.getRoadLength() ).toBe( 200 );
		expect( horizontal.successor ).toBeNull();
		expect( horizontal.predecessor ).toBeNull();

		expect( vertical.spline.getLength() ).toBe( 200 );
		expect( vertical.successor ).toBeNull();
		expect( vertical.predecessor ).toBeNull();
		expect( vertical.spline.getSplineSegments().length ).toBe( 1 );

	} );

	it( 'should re-update junction when spline is slightly shifted', () => {

		baseTest.createFourWayJunction( roadService, intersectionService );

		expect( mapService.map.getJunctionCount() ).toBe( 1 );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		vertical.spline.controlPoints.forEach( point => point.position.x += 50 );

		tool.onSplineUpdated( vertical.spline );

		const splines = mapService.map.getSplines();

		expect( splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
		expect( splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeDefined();

		expect( mapService.map.getJunctionCount() ).toBe( 1 );
		expect( mapService.map.getRoadCount() ).toBe( 16 );

		expect( mapService.map.getSplineCount() ).toBe( 14 );

		expect( horizontal.spline.getLength() ).toBe( 200 );
		expect( horizontal.successor ).toBeDefined();
		expect( horizontal.predecessor ).toBeNull();
		expect( horizontal.spline.getSplineSegments().length ).toBe( 3 );

		expect( vertical.spline.getLength() ).toBe( 200 );
		expect( vertical.successor ).toBeDefined();
		expect( vertical.predecessor ).toBeNull();
		expect( vertical.spline.getSplineSegments().length ).toBe( 3 );

	} );

} );
