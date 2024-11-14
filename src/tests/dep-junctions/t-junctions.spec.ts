import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { SplineEventListener } from "app/listeners/spline-event-listener";
import { SplineManager } from "app/managers/spline-manager";
import { RoadNode } from "app/objects/road/road-node";
import { TvContactPoint, TvLaneType } from "app/map/models/tv-common";
import { DepIntersectionService } from "app/deprecated/dep-intersection.service";
import { JunctionService } from "app/services/junction/junction.service";
import { MapValidatorService } from "app/services/map/map-validator.service";
import { MapService } from "app/services/map/map.service";
import { RoadService } from "app/services/road/road.service";
import { RoadToolHelper } from "app/tools/road/road-tool-helper.service";
import { BaseTest } from "tests/base-test.spec";
import { Vector2, Vector3 } from "three";
import { SplineControlPoint } from "app/objects/road/spline-control-point";

const DEFAULT_ROAD_WIDTH = 12.2;

xdescribe( 't-junction tests', () => {

	let baseTest = new BaseTest();

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: DepIntersectionService;
	let junctionService: JunctionService;
	let eventServiceProvider: EventServiceProvider;
	let splineEventListener: SplineEventListener;
	let roadToolService: RoadToolHelper;
	let splineManager: SplineManager;
	let mapValidator: MapValidatorService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadToolHelper ]
		} );

		roadToolService = TestBed.inject( RoadToolHelper );
		roadService = roadToolService.roadService;
		splineManager = TestBed.inject( SplineManager );

		mapService = TestBed.inject( MapService );
		intersectionService = TestBed.inject( DepIntersectionService );
		junctionService = TestBed.inject( JunctionService );
		splineEventListener = TestBed.inject( SplineEventListener );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

		mapValidator = TestBed.inject( MapValidatorService );

	} );

	it( 'should cut roads for t-junction at road end', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -100, 0, 0 ) ) );
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 100, 0, 0 ) ) );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, -100, 0 ) ) );
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 100, 0 ) ) );

		roadService.add( xAxisRoad );
		roadService.add( yAxisRoad );

		const junction = junctionService.createNewJunction();

		const coord1 = xAxisRoad.getRoadCoord( 100 );
		intersectionService.cutRoadForJunction( coord1, junction );
		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

		const coord2 = yAxisRoad.getRoadCoord( 100 );
		intersectionService.cutRoadForJunction( coord2, junction );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

	} );

	it( 'should cut roads for t-junction at road start', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 100, 0, 0 ) ) );
		roadService.add( xAxisRoad );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, -100, 0 ) ) );
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 100, 0 ) ) );
		roadService.add( yAxisRoad );

		const junction = junctionService.createNewJunction();

		const coord1 = xAxisRoad.getRoadCoord( 100 );
		intersectionService.cutRoadForJunction( coord1, junction );

		const coord2 = yAxisRoad.getRoadCoord( 100 );
		intersectionService.cutRoadForJunction( coord2, junction );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( newYAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );


	} );

	it( 'should create t-junction connections at road end', () => {

		expect( roadService.getRoadCount() ).toBe( 0 );

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -100, 0, 0 ) ) );
		xAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );
		roadService.add( xAxisRoad );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, -100, 0 ) ) );
		yAxisRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 100, 0 ) ) );
		roadService.add( yAxisRoad );

		intersectionService.checkSplineIntersections( yAxisRoad.spline );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		const junction = junctionService.getJunctionById( 1 );

		expect( junction.getConnectionCount() ).toBe( 6 );
		expect( roadService.getRoadCount() ).toBe( 9 );

	} );

	it( 'should create t-junction connections at road start', () => {

		expect( roadService.getRoadCount() ).toBe( 0 );

		baseTest.createTJunction( roadService, intersectionService );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		const junction = junctionService.getJunctionById( 1 );

		expect( junction.getConnectionCount() ).toBe( 6 );
		expect( roadService.getRoadCount() ).toBe( 9 );

	} );

	it( 'should work when horizontal spline is removed', () => {

		expect( mapService.splines.length ).toBe( 0 );

		baseTest.createTJunction( roadService, intersectionService );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		splineManager.removeSpline( horizontal.spline );

		const splines = mapService.map.getSplines();

		expect( splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeUndefined();
		expect( splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeDefined();

		if ( mapService.roads.length == 2 ) {
			throw new Error( "mapService.roads.length == 2" );
		}

		expect( mapService.junctions.length ).toBe( 0 );
		expect( mapService.roads.length ).toBe( 1 );
		expect( mapService.splines.length ).toBe( 1 );

	} );

	it( 'should work when vertical spline is removed', () => {

		expect( mapService.splines.length ).toBe( 0 );

		baseTest.createTJunction( roadService, intersectionService );

		const horizontal = roadService.getRoad( 1 );
		const vertical = roadService.getRoad( 2 );

		splineManager.removeSpline( vertical.spline );

		if ( mapService.roads.length == 0 ) {
			throw new Error( "mapService.roads.length == 0" );
		}

		expect( mapService.junctions.length ).toBe( 0 );
		expect( mapService.roads.length ).toBe( 1 );
		expect( mapService.splines.length ).toBe( 1 );

		expect( mapService.splines.find( i => i.uuid == horizontal.spline.uuid ) ).toBeDefined();
		expect( mapService.splines.find( i => i.uuid == vertical.spline.uuid ) ).toBeUndefined();

	} );

	it( 'should create 4-way junction for connected road', () => {

		/**
		 * We generate this models:
		 * 1 is left road
		 * 2 is right road
		 * 3 is joining road
		 * 4 is vertical road
		 *
		 *
		 * ------------------------
		 * 	1 |	 3	| J |	5 | 2
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

		const vertical = baseTest.createDefaultRoad( roadService, [ new Vector2( 0, -100 ), new Vector2( 0, 1 ) ] );
		splineManager.addSpline( vertical.spline );

		expect( mapService.roads.length ).toBe( 5 + 6 );
		expect( mapService.junctions.length ).toBe( 1 );
		expect( mapService.splines.length ).toBe( 4 + 6 );
		expect( mapService.nonJunctionRoads.length ).toBe( 5 );
		expect( mapService.junctionRoads.length ).toBe( 6 );

		const junction = junctionService.getJunctionById( 1 );

		expect( junction ).toBeDefined();
		expect( junction.getConnectionCount() ).toBe( 6 );

		expect( roadService.getRoad( 1 ).predecessor ).toBeUndefined();
		expect( roadService.getRoad( 1 ).successor.element ).toBe( roadService.getRoad( 3 ) );

		expect( roadService.getRoad( 3 ).predecessor.element ).toBe( roadService.getRoad( 1 ) );
		expect( roadService.getRoad( 3 ).successor.element ).toBe( junction );

		expect( roadService.getRoad( 4 ).predecessor ).toBeUndefined();
		expect( roadService.getRoad( 4 ).successor.element ).toBe( junction );

		expect( roadService.getRoad( 5 ).predecessor.element ).toBe( junction );
		expect( roadService.getRoad( 5 ).successor.element ).toBe( roadService.getRoad( 2 ) );

		expect( roadService.getRoad( 2 ).predecessor.element ).toBe( roadService.getRoad( 5 ) );
		expect( roadService.getRoad( 2 ).successor ).toBeUndefined();

		// VALIDATE CONNECTIONS

		expect( junction.getConnection( 0 ).incomingRoadId ).toBe( 4 );
		expect( junction.getConnection( 0 ).getLinkCount() ).toBe( 3 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 0 ].connectingLane.id ).toBe( -1 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 0 ].connectingLane.predecessorId ).toBe( -1 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 0 ].connectingLane.successorId ).toBe( -1 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 1 ].connectingLane.type ).toBe( TvLaneType.shoulder );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 1 ].connectingLane.id ).toBe( -2 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 1 ].connectingLane.predecessorId ).toBe( -2 );
		expect( junction.getConnection( 0 ).getLaneLinks()[ 1 ].connectingLane.successorId ).toBe( -2 );

	} );

} );
