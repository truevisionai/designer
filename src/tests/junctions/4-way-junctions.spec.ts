import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { TvContactPoint } from 'app/map/models/tv-common';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { ConnectionService } from 'app/map/junction/connection/connection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { MapService } from 'app/services/map/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { Vector2, Vector3 } from 'three';
import { BaseTest } from 'tests/base-test.spec';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { RoadNode } from 'app/objects/road-node';
import { TvRoadLinkChildType } from 'app/map/models/tv-road-link-child';
import { SplineManager } from 'app/managers/spline-manager';
import { MapValidatorService } from 'app/services/map/map-validator.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe( '4-way-junction tests', () => {

	let baseTest = new BaseTest();

	let roadToolService: RoadToolService;
	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let splineManager: SplineManager;
	let mapValidator: MapValidatorService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		roadToolService = TestBed.get( RoadToolService );
		roadService = roadToolService.roadService

		mapService = TestBed.get( MapService );
		intersectionService = TestBed.get( IntersectionService );
		junctionService = TestBed.get( JunctionService );
		splineManager = TestBed.get( SplineManager );

		let eventServiceProvider = TestBed.get( EventServiceProvider );
		eventServiceProvider.init();

		mapValidator = TestBed.get( MapValidatorService );

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

		roadService.add( roadA );
		roadService.add( roadB );

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

		mapValidator.validateMap( mapService.map, true );
	} )

	it( 'should create simple junction between same roads', () => {

		// left to right
		const roadA = roadService.createDefaultRoad();
		roadA.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		roadA.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		roadService.add( roadA );

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

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );

		// expect( junction.connections.get( 0 ) ).toBeDefined()
		// expect( junction.connections.get( 0 ).incomingRoad ).toBe( roadA );
		// expect( junction.connections.get( 0 ).outgoingRoad ).toBe( roadB );
		// expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		// expect( junction.connections.get( 1 ) ).toBeDefined()
		// expect( junction.connections.get( 1 ).incomingRoad ).toBe( roadB );
		// expect( junction.connections.get( 1 ).outgoingRoad ).toBe( roadA );
		// expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

		expect( mapService.highestestRoadId ).toBe( 4 );
		mapValidator.validateMap( mapService.map, true );

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

		roadService.add( road1 );
		roadService.add( road2 );

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

		expect( mapService.highestestRoadId ).toBe( 16 );
		mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should create 4-way junction for connected road', () => {

		// expect( true ).toBe( false );

		/**
		 * We generate this models:
		 * 1 is left road
		 * 2 is right road
		 * 3 is joining road
		 * 4 is vertical road
		 *
		 * 		 	|   |
		 *		 	| 5 |
		 *  	 	|   |
		 *       	|   |
		 * ------------------------
		 * 	1 |	 3	| J |	6 | 2
		 * ------------------------
		 * 	 	 	|   |
		 * 		 	|   |
		 * 		 	| 4 |
		 * 		 	|   |
		 */

		const leftRoad = baseTest.createDefaultRoad( roadService, [ new Vector2( -100, 0 ), new Vector2( -50, 0 ) ] );
		const rightRoad = baseTest.createDefaultRoad( roadService, [ new Vector2( 50, 0 ), new Vector2( 100, 0 ) ] );

		const joiningRoad = roadToolService.createJoiningRoad(
			new RoadNode( leftRoad, TvContactPoint.END ),
			new RoadNode( rightRoad, TvContactPoint.START )
		);

		roadService.add( joiningRoad );

		const vertical = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -100 ), new Vector2( 0, 100 ) ] );

		expect( mapService.roads.length ).toBe( 4 );
		expect( roadService.getRoad( 1 ) ).toBe( leftRoad );
		expect( roadService.getRoad( 2 ) ).toBe( rightRoad );
		expect( roadService.getRoad( 3 ) ).toBe( joiningRoad );
		expect( roadService.getRoad( 4 ) ).toBe( vertical );

		splineManager.updateSpline( vertical.spline );

		expect( roadService.getRoad( 1 ) ).toBe( leftRoad );
		expect( roadService.getRoad( 2 ) ).toBe( rightRoad );
		expect( roadService.getRoad( 3 ) ).toBe( joiningRoad );
		expect( roadService.getRoad( 4 ) ).toBe( vertical );
		expect( roadService.getRoad( 5 ) ).toBeDefined();
		expect( roadService.getRoad( 6 ) ).toBeDefined();


		expect( joiningRoad ).toBeDefined();
		expect( mapService.junctions.length ).toBe( 1 );
		expect( mapService.roads.length ).toBe( 18 );
		expect( mapService.nonJunctionRoads.length ).toBe( 6 );
		expect( mapService.junctionRoads.length ).toBe( 12 );
		expect( mapService.splines.length ).toBe( 16 );

		const junction = mapService.junctions[ 0 ];
		const verticalTopHalf = roadService.getRoad( 5 );
		const joiningRightHalf = roadService.getRoad( 6 );

		expect( joiningRoad.predecessor.element.id ).toBe( leftRoad.id );
		expect( joiningRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( joiningRoad.successor.element ).toBe( junction );
		expect( joiningRoad.successor.elementType ).toBe( TvRoadLinkChildType.junction );
		expect( joiningRoad.successor.elementId ).toBe( junction.id );
		expect( joiningRoad.successor.contactPoint ).toBeUndefined();

		expect( leftRoad.successor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( leftRoad.successor.elementId ).toBe( joiningRoad.id );
		expect( leftRoad.successor.contactPoint ).toBe( TvContactPoint.START );
		expect( leftRoad.predecessor ).toBeUndefined();

		expect( rightRoad.predecessor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( rightRoad.predecessor.elementId ).toBe( joiningRightHalf.id );//
		expect( rightRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );
		expect( rightRoad.successor ).toBeUndefined();

		expect( joiningRightHalf.predecessor.elementType ).toBe( TvRoadLinkChildType.junction );
		expect( joiningRightHalf.predecessor.elementId ).toBe( junction.id );
		expect( joiningRightHalf.predecessor.contactPoint ).toBeUndefined();

		expect( verticalTopHalf.predecessor.elementType ).toBe( TvRoadLinkChildType.junction );
		expect( verticalTopHalf.predecessor.elementId ).toBe( junction.id );
		expect( verticalTopHalf.predecessor.contactPoint ).toBeUndefined();

		expect( vertical.successor.elementType ).toBe( TvRoadLinkChildType.junction );
		expect( vertical.successor.elementId ).toBe( junction.id );
		expect( vertical.successor.contactPoint ).toBeUndefined();

		expect( joiningRoad.successor.elementType ).toBe( TvRoadLinkChildType.junction );
		expect( joiningRoad.successor.elementId ).toBe( junction.id );
		expect( joiningRoad.successor.contactPoint ).toBeUndefined();

		expect( mapService.highestestRoadId ).toBe( 18 );
		mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should reset road when 4-way junction is removed from connected road', () => {

		/**
		 * We generate this models:
		 * 1 is left road
		 * 2 is right road
		 * 3 is joining road
		 * 4 is vertical road
		 *
		 * 		 	|   |
		 *		 	| 5 |
		 *  	 	|   |
		 *       	|   |
		 * ------------------------
		 * 	1 |	 3	| J |	6 | 2
		 * ------------------------
		 * 	 	 	|   |
		 * 		 	|   |
		 * 		 	| 4 |
		 * 		 	|   |
		 */

		const leftRoad = baseTest.createDefaultRoad( roadService, [ new Vector2( -100, 0 ), new Vector2( -50, 0 ) ] );
		const rightRoad = baseTest.createDefaultRoad( roadService, [ new Vector2( 50, 0 ), new Vector2( 100, 0 ) ] );

		const joiningRoad = roadToolService.createJoiningRoad(
			new RoadNode( leftRoad, TvContactPoint.END ),
			new RoadNode( rightRoad, TvContactPoint.START )
		);

		roadService.add( joiningRoad );

		const vertical = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -100 ), new Vector2( 0, 100 ) ] );

		expect( mapService.roads.length ).toBe( 4 );
		expect( roadService.getRoad( 1 ) ).toBe( leftRoad );
		expect( roadService.getRoad( 2 ) ).toBe( rightRoad );
		expect( roadService.getRoad( 3 ) ).toBe( joiningRoad );
		expect( roadService.getRoad( 4 ) ).toBe( vertical );

		// this will create junction
		splineManager.updateSpline( vertical.spline );

		// move vertical road away
		vertical.spline.controlPoints.forEach( point => point.position.x += 300 );

		// this should remove junction and remove spline roads
		splineManager.removeSpline( vertical.spline );

		expect( mapService.junctions.length ).toBe( 0 );
		expect( mapService.roads.length ).toBe( 3 );

		expect( joiningRoad ).toBeDefined();
		expect( joiningRoad.spline.controlPoints.length ).toBe( 4 );
		expect( joiningRoad.spline.getLength() ).toBeCloseTo( 100 );

		expect( joiningRoad.predecessor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( joiningRoad.predecessor.elementId ).toBe( leftRoad.id );
		expect( joiningRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( joiningRoad.successor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( joiningRoad.successor.elementId ).toBe( rightRoad.id );
		expect( joiningRoad.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( leftRoad.successor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( leftRoad.successor.elementId ).toBe( joiningRoad.id );
		expect( leftRoad.successor.contactPoint ).toBe( TvContactPoint.START );
		expect( leftRoad.predecessor ).toBeUndefined();

		expect( rightRoad.predecessor.elementType ).toBe( TvRoadLinkChildType.road );
		expect( rightRoad.predecessor.elementId ).toBe( joiningRoad.id );
		expect( rightRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );
		expect( rightRoad.successor ).toBeUndefined();

		mapValidator.validateMap( mapService.map, true );
	} );

	it( 'should add non-driving lanes correctly', inject( [ ConnectionService ], ( junctionConnectionService: ConnectionService ) => {

		// left to right
		const left = roadService.createDefaultRoad();
		left.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		left.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		const right = roadService.createDefaultRoad();
		right.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );
		right.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		roadService.add( left );
		roadService.add( right );

		const junction = junctionService.createNewJunction();

		const incoming = left.getEndPosTheta().toRoadCoord( left );
		const outgoing = right.getStartPosTheta().toRoadCoord( right );

		const connection = junctionConnectionService.createConnection( junction, incoming, outgoing );

		junction.addConnection( connection );

		junctionConnectionService.postProcessConnection( junction, connection );

		// TODO: CHECK THIS SHOULD BE 3
		expect( connection.laneLink.length ).toBe( 2 );

		mapValidator.validateMap( mapService.map, true );

	} ) );

	it( 'should create 2 4-way junctions automatically with horizontal roads', () => {

		/**
		 * We generate this models:
		 * 1 is left road
		 * 2 is right road
		 * 3 is joining road
		 * 4 is vertical road


								|   	|
								|   	|
								|   18	|
								|   	|
		---------------------------------------------------------------------
		  2						|  J-2	|								19
		---------------------------------------------------------------------
								|   	|
								|   	|
								|   4	|
								|   	|
		---------------------------------------------------------------------
		  1						|  J-1	|								5
		---------------------------------------------------------------------
								|   	|
								|   	|
								|   3	|


		*/

		expect( roadService.getRoadCount() ).toBe( 0 );

		// left to right
		const horizontalBottom = baseTest.createDefaultRoad( roadService, [ new Vector2( -100, 0 ), new Vector2( 100, 0 ) ] );
		const horizontalTop = baseTest.createDefaultRoad( roadService, [ new Vector2( -100, 50 ), new Vector2( 100, 50 ) ] );

		// bottom to top
		const verticalRoad = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -200 ), new Vector2( 0, 200 ) ] );

		splineManager.updateSpline( verticalRoad.spline );

		expect( junctionService.junctions.length ).toBe( 2 );
		expect( roadService.roads.length ).toBe( 31 );
		expect( roadService.junctionRoads.length ).toBe( 24 );					// 12 for each
		expect( roadService.nonJunctionRoads.length ).toBe( 7 );

		expect( roadService.getRoad( 1 ) ).toBe( horizontalBottom );
		expect( roadService.getRoad( 2 ) ).toBe( horizontalTop );
		expect( roadService.getRoad( 3 ) ).toBe( verticalRoad );
		expect( roadService.getRoad( 4 ) ).toBeDefined();
		expect( roadService.getRoad( 5 ) ).toBeDefined();
		expect( roadService.getRoad( 18 ) ).toBeDefined();
		expect( roadService.getRoad( 19 ) ).toBeDefined();

		const junction1 = mapService.junctions[ 0 ];
		const junction2 = mapService.junctions[ 1 ];

		const horizontalBottomRight = roadService.getRoad( 5 );
		const horizontalTopRight = roadService.getRoad( 19 );
		const verticalRoadBottom = roadService.getRoad( 3 );
		const verticalRoadMiddle = roadService.getRoad( 4 );
		const verticalRoadTop = roadService.getRoad( 18 );

		expect( verticalRoadBottom.predecessor ).toBeUndefined();
		expect( verticalRoadBottom.successor.element ).toBe( junction1 );

		expect( verticalRoadMiddle.predecessor.element ).toBe( junction1 );
		expect( verticalRoadMiddle.successor.element ).toBe( junction2 );

		expect( verticalRoadTop.predecessor.element ).toBe( junction2 );
		expect( verticalRoadTop.successor ).toBeUndefined();

		expect( horizontalBottom.predecessor ).toBeUndefined();
		expect( horizontalBottom.successor.element ).toBe( junction1 );

		expect( horizontalBottomRight.predecessor.element ).toBe( junction1 );
		expect( horizontalBottomRight.successor ).toBeUndefined();

		expect( horizontalTop.predecessor ).toBeUndefined();
		expect( horizontalTop.successor.element ).toBe( junction2 );

		expect( horizontalTopRight.predecessor.element ).toBe( junction2 );
		expect( horizontalTopRight.successor ).toBeUndefined();

		mapValidator.validateMap( mapService.map, true );

		// shift vertical
		verticalRoad.spline.controlPoints.forEach( point => point.position.x += 5 );

		expect( junctionService.junctions.length ).toBe( 2 );
		expect( roadService.roads.length ).toBe( 31 );
		expect( roadService.junctionRoads.length ).toBe( 24 );					// 12 for each
		expect( roadService.nonJunctionRoads.length ).toBe( 7 );

		expect( mapService.highestestRoadId ).toBe( 31 );
		mapValidator.validateMap( mapService.map, true );

	} );

	it( 'should create 2 4-way junctions automatically with vertical roads', () => {


		/**

			|18	|		|	|
			|  	|		| 3 |
		- - - - - - - - - - - -
		1 ->| J2|  19	| J1| -> 4
		- - - - - - - - - - - -
			|  	|		|  	|
			|17	|		| 2	|

		 */

		function expectValidJunction () {

			expect( mapValidator.validateMap( mapService.map ) ).toBe( true );

			expect( junctionService.junctions.length ).toBe( 2 );
			expect( junctionService.junctions[ 0 ].id ).toBe( 1 );
			expect( junctionService.junctions[ 1 ].id ).toBe( 2 );
			expect( roadService.roads.length ).toBe( 31 );
			expect( roadService.nonJunctionRoads.length ).toBe( 7 );
			expect( roadService.junctionRoads.length ).toBe( 24 );					// 12 for each

			const rightJunction = junctionService.getJunctionById( 1 );
			const leftJunction = junctionService.getJunctionById( 2 )

			expect( rightJunction.connections.size ).toBe( 12 );
			expect( leftJunction.connections.size ).toBe( 12 );

			expect( roadService.getRoad( 1 ) ).toBe( horizontal );
			expect( roadService.getRoad( 2 ) ).toBe( verticalRight );
			expect( roadService.getRoad( 17 ) ).toBe( verticalLeft );
			expect( roadService.getRoad( 3 ) ).toBeDefined();
			expect( roadService.getRoad( 4 ) ).toBeDefined();
			expect( roadService.getRoad( 18 ) ).toBeDefined();
			expect( roadService.getRoad( 19 ) ).toBeDefined();

			expect( roadService.getRoad( 1 ).predecessor ).toBeUndefined();
			expect( roadService.getRoad( 1 ).successor.element ).toBe( leftJunction );

			expect( roadService.getRoad( 2 ).predecessor ).toBeUndefined();
			expect( roadService.getRoad( 2 ).successor.element ).toBe( rightJunction );

			expect( roadService.getRoad( 3 ).predecessor.element ).toBe( rightJunction );
			expect( roadService.getRoad( 3 ).successor ).toBeUndefined();

			expect( roadService.getRoad( 4 ).predecessor.element ).toBe( rightJunction );
			expect( roadService.getRoad( 4 ).successor ).toBeUndefined();

			expect( roadService.getRoad( 17 ).predecessor ).toBeUndefined();
			expect( roadService.getRoad( 17 ).successor.element ).toBe( leftJunction );

			expect( roadService.getRoad( 18 ).predecessor.element ).toBe( leftJunction );
			expect( roadService.getRoad( 18 ).successor ).toBeUndefined();

			expect( roadService.getRoad( 19 ).predecessor.element ).toBe( leftJunction );
			expect( roadService.getRoad( 19 ).successor.element ).toBe( rightJunction );

		}

		expect( roadService.getRoadCount() ).toBe( 0 );

		const horizontal = baseTest.createDefaultRoad( roadService, [ new Vector2( -200, 0 ), new Vector2( 200, 0 ) ] );
		const verticalRight = baseTest.createDefaultRoad( roadService, [ new Vector2( 50, -100 ), new Vector2( 50, 100 ) ] );

		// add first vertical road on right
		splineManager.updateSpline( verticalRight.spline );

		expect( roadService.getRoad( 1 ) ).toBe( horizontal );
		expect( roadService.getRoad( 2 ) ).toBe( verticalRight );
		expect( roadService.roads.length ).toBe( 4 + 12 );
		expect( roadService.nonJunctionRoads.length ).toBe( 4 );
		expect( roadService.junctionRoads.length ).toBe( 12 );					// 12 for each

		// // add second vertical road on left
		const verticalLeft = baseTest.createDefaultRoad( roadService, [ new Vector2( -50, -100 ), new Vector2( -50, 100 ) ] );

		splineManager.updateSpline( verticalLeft.spline );
		expect( mapService.highestestRoadId ).toBe( 31 );
		expectValidJunction();

		verticalLeft.spline.controlPoints.forEach( point => point.position.x += 1 );
		splineManager.updateSpline( verticalLeft.spline );
		expect( mapService.highestestRoadId ).toBe( 31 );
		expectValidJunction();

	} )

	it( 'should work when vertical spline is removed', () => {

		baseTest.createFourWayJunction( roadService, intersectionService );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		splineManager.removeSpline( vertical.spline );

		expect( mapService.splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
		expect( mapService.splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeUndefined();

		expect( mapService.map.getJunctionCount() ).toBe( 0 );
		expect( mapService.map.getRoadCount() ).toBe( 1 );
		expect( mapService.map.getSplineCount() ).toBe( 1 );

		expect( horizontal.length ).toBe( 200 );
		expect( horizontal.successor ).toBeUndefined();
		expect( horizontal.predecessor ).toBeUndefined();

		expect( vertical.spline.getLength() ).toBe( 200 );

		mapValidator.validateMap( mapService.map, true );

	} );

	// TODO: Fix this test
	//it( 'should reset when whole spline is moved away', () => {
	//
	//	expect( mapService.map.getSplineCount() ).toBe( 0 );
	//
	//	baseTest.createFourWayJunction( roadService, intersectionService );
	//
	//	expect( mapService.map.getJunctionCount() ).toBe( 1 );
	//
	//	const horizontal = roadService.getRoad( 1 );
	//	const vertical = roadService.getRoad( 2 );
	//
	//	vertical.spline.controlPoints.forEach( point => point.position.x += 300 );
	//
	//	splineManager.updateSpline( vertical.spline );
	//
	//	// FLAKY TEST
	//	expect( mapService.splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
	//	expect( mapService.splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeDefined();
	//
	//	expect( mapService.junctions.length ).toBe( 0 );
	//	expect( mapService.roads.length ).toBe( 2 );
	//
	//	// FLAKY TEST
	//	expect( mapService.splines.length ).toBe( 2 );
	//
	//	expect( horizontal.getRoadLength() ).toBe( 200 );
	//	expect( horizontal.successor ).toBeUndefined();
	//	expect( horizontal.predecessor ).toBeUndefined();
	//
	//	expect( vertical.spline.getLength() ).toBe( 200 );
	//	expect( vertical.successor ).toBeUndefined();
	//	expect( vertical.predecessor ).toBeUndefined();
	//	expect( vertical.spline.getSplineSegments().length ).toBe( 1 );
	//
	//	mapValidator.validateMap( mapService.map, true );
	//
	//} );

	it( 'should re-update junction when spline is slightly shifted', () => {

		baseTest.createFourWayJunction( roadService, intersectionService );

		expect( mapService.map.getJunctionCount() ).toBe( 1 );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		vertical.spline.controlPoints.forEach( point => point.position.x = 10 );

		splineManager.updateSpline( vertical.spline );

		expect( mapService.splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
		expect( mapService.splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeDefined();

		expect( mapService.map.getJunctionCount() ).toBe( 1 );
		expect( mapService.map.getRoadCount() ).toBe( 16 );

		expect( mapService.map.getSplineCount() ).toBe( 14 );

		expect( horizontal.spline.getLength() ).toBe( 200 );
		expect( horizontal.successor ).toBeDefined();
		expect( horizontal.predecessor ).toBeUndefined();
		expect( horizontal.spline.getSplineSegments().length ).toBe( 3 );

		expect( vertical.spline.getLength() ).toBe( 200 );
		expect( vertical.successor ).toBeDefined();
		expect( vertical.predecessor ).toBeUndefined();
		expect( vertical.spline.getSplineSegments().length ).toBe( 3 );

		mapValidator.validateMap( mapService.map, true );
	} );

	it( 'should create t-junction between one side lane road', () => {

		// 3 lane on each side
		const horizontal = baseTest.createDefaultRoad( roadService, [
			new Vector2( -100, 0 ),
			new Vector2( 100, 0 )
		] );

		// 1 lane on each side
		const vertical = baseTest.createRoad( roadService, [
			new Vector2( 0, -100 ),
			new Vector2( 0, 0 )
		], 1, 1 );

		splineManager.updateSpline( vertical.spline );

		expect( mapService.junctions.length ).toBe( 1 );

		const junction = mapService.getJunction( 1 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 6 );
		expect( roadService.roads.length ).toBe( 9 );
		expect( roadService.junctionRoads.length ).toBe( 6 );
		expect( junctionService.junctions.length ).toBe( 1 );


	} );

} );
