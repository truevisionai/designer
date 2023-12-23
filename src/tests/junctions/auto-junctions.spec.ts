import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { RoadRemovedEvent } from 'app/events/map-events';
import { RoadEventListener } from 'app/listeners/road-event-listener';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { JunctionConnectionService } from 'app/services/junction/junction-connection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { Maths } from 'app/utils/maths';
import { Vector3 } from 'three';

describe( 'automatic junctions', () => {

	let tool: RoadTool;

	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let junctionConnectionService: JunctionConnectionService;
	let roadEventListener: RoadEventListener

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		roadEventListener = TestBed.inject( RoadEventListener );
		junctionConnectionService = TestBed.inject( JunctionConnectionService );

	} );

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

		intersectionService.checkRoadIntersections( road2 );

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
			expect( road.getRoadCoordAt( 0 ) ).toBeDefined();

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

		// expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( 1 );
		// expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( 2 );
		expect( junction.connections.get( 0 ).connectingRoad.id ).toBe( 5 );

		const bottomHalfRoad = roadService.getRoad( 3 );
		expect( bottomHalfRoad ).toBeDefined();
		expect( bottomHalfRoad.successor ).toBeUndefined();
		expect( bottomHalfRoad.predecessor ).toBeDefined();
		expect( bottomHalfRoad.predecessor.elementId ).toBe( junction.id );

		const connectingRoad4to5 = junction.connections.get( 0 ).connectingRoad;

		expect( connectingRoad4to5.geometries.length ).toBe( 5 );

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

		intersectionService.checkRoadIntersections( road2 );

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

		roadEventListener.onRoadRemoved( new RoadRemovedEvent( bottomRoad ) );

		expect( roadService.roads.length ).toBe( 9 );
		expect( junction.connections.size ).toBe( 6 );

		const cornerConnections = junction.getConnections().filter( i => i.laneLink.length == 3 );
		expect( cornerConnections.length ).toBe( 3 );

	} );

	it( 'should add non-driving lanes correctly', () => {

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		road1.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		const road2 = roadService.createNewRoad();
		road2.addGetLaneSection( 0 );
		road2.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		road2.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		const road3 = roadService.createDefaultRoad();
		road3.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );
		road3.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		const junction = junctionService.createNewJunction();

		const connection = new TvJunctionConnection( 1, road1, road2, TvContactPoint.START, road3 );

		junction.addConnection( connection );

		// intersectionService.postProcessJunction( junction );

		junctionConnectionService.addNonDrivingLaneLinks( connection );

		expect( connection.laneLink.length ).toBe( 3 );

	} );


} );
