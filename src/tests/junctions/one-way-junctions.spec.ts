// import { HttpClientModule } from "@angular/common/http";
// import { TestBed } from "@angular/core/testing";
// import { MatSnackBarModule } from "@angular/material/snack-bar";
// import { DepIntersectionService } from "app/deprecated/dep-intersection.service";
// import { EventServiceProvider } from "app/listeners/event-service-provider";
// import { SplineEventListener } from "app/listeners/spline-event-listener";
// import { IntersectionManager } from "app/managers/intersection-manager";
// import { SplineManager } from "app/managers/spline-manager";
// import { TvLaneType } from "app/map/models/tv-common";
// import { JunctionService } from "app/services/junction/junction.service";
// import { MapValidatorService } from "app/services/map/map-validator.service";
// import { MapService } from "app/services/map/map.service";
// import { RoadService } from "app/services/road/road.service";
// import { RoadToolHelper } from "app/tools/road/road-tool-helper.service";
// import { BaseTest } from "tests/base-test.spec";
// import { Vector2 } from "three";

// xdescribe( 'one-way junctions tests', () => {

// 	let baseTest = new BaseTest();

// 	let mapService: MapService;
// 	let roadService: RoadService;
// 	let intersectionService: DepIntersectionService;
// 	let junctionService: JunctionService;
// 	let eventServiceProvider: EventServiceProvider;
// 	let splineEventListener: SplineEventListener;
// 	let roadToolService: RoadToolHelper;
// 	let splineManager: SplineManager;
// 	let mapValidator: MapValidatorService;
// 	let intersectionManager: IntersectionManager;

// 	beforeEach( () => {

// 		TestBed.configureTestingModule( {
// 			imports: [ HttpClientModule, MatSnackBarModule ],
// 			providers: [ RoadToolHelper ]
// 		} );

// 		roadToolService = TestBed.inject( RoadToolHelper );
// 		roadService = roadToolService.roadService;
// 		splineManager = TestBed.inject( SplineManager );
// 		intersectionManager = TestBed.inject( IntersectionManager );

// 		mapService = TestBed.inject( MapService );
// 		intersectionService = TestBed.inject( DepIntersectionService );
// 		junctionService = TestBed.inject( JunctionService );
// 		splineEventListener = TestBed.inject( SplineEventListener );
// 		eventServiceProvider = TestBed.inject( EventServiceProvider );
// 		eventServiceProvider.init();

// 		mapValidator = TestBed.inject( MapValidatorService );

// 	} );

// 	it( 'should work for one-way roads in same direction', () => {

// 		// ------->			------->
// 		// 1	>			1
// 		// ------->			------->
// 		// -1	>			-1
// 		// ------->			------->
// 		// -2	>			-2
// 		// ------->			------->

// 		const left = baseTest.createOneWayRoad( roadService, [ new Vector2( -50, 0 ), new Vector2( 50, 0 ) ] );
// 		const right = baseTest.createOneWayRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ] );

// 		const coords = [
// 			left.getEndPosTheta().toRoadCoord( left ),
// 			right.getStartPosTheta().toRoadCoord( right )
// 		]

// 		const junction = intersectionManager.createJunctionFromCoords( coords );

// 		expect( junction ).toBeDefined();
// 		expect( junction.getConnectionCount() ).toBe( 2 );

// 		mapService.roads.forEach( road => road.laneSections.forEach( section => {
// 			if ( !section.areRightLanesInOrder() ) {
// 				throw new Error( 'Right lanes are not in order' );
// 			}
// 		} ) )

// 		expect( junction.getConnection( 0 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 0 ).laneLink.length ).toBe( 2 );

// 		expect( junction.getConnection( 1 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 1 ).laneLink.length ).toBe( 1 );


// 	} );

// 	it( 'should work for t-junction for one-way roads', () => {

// 		// ------->						------->
// 		// 1	>						 1
// 		// ------->						------->
// 		// -1	>						 -1
// 		// ------->						------->
// 		// -2	>						 -2
// 		// ------->						------->
// 		//					^^^
// 		// 			| 1	 |	-1	| -2 |
// 		// 			|	 |		| 	 |
// 		// 			|	 |		|	 |
// 		// 			|	 | 		|	 |

// 		const left = baseTest.createOneWayRoad( roadService, [ new Vector2( -50, 0 ), new Vector2( 50, 0 ) ] );
// 		const right = baseTest.createOneWayRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ] );
// 		const bottom = baseTest.createOneWayRoad( roadService, [ new Vector2( 0, -100 ), new Vector2( 0, 0 ) ] );

// 		const coords = [
// 			left.getEndPosTheta().toRoadCoord( left ),
// 			right.getStartPosTheta().toRoadCoord( right ),
// 			bottom.getEndPosTheta().toRoadCoord( bottom ),
// 		];

// 		const junction = intersectionManager.createJunctionFromCoords( coords );

// 		expect( junction ).toBeDefined();
// 		expect( junction.getConnectionCount() ).toBe( 6 );

// 		mapService.roads.forEach( road => road.laneSections.forEach( section => {
// 			if ( !section.areRightLanesInOrder() ) {
// 				throw new Error( 'Right lanes are not in order' );
// 			}
// 		} ) )

// 		expect( junction.getConnection( 0 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 0 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 0 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
// 		expect( junction.getConnection( 0 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 1 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 1 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 1 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 1 ).isCornerConnection ).toBe( true );

// 		// TODO: FIX: MISMATCH IN LANE LINK VS LANES
// 		// expect( junction.getConnection( 1 ).connectingLaneSection.lanes.size ).toBe( 2 );
// 		// expect( junction.getConnection( 1 ).laneLink.length ).toBe( 1 );
// 		//
// 		expect( junction.getConnection( 2 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 2 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 2 ).isCornerConnection ).toBe( true );

// 		expect( junction.getConnection( 3 ).incomingRoadId ).toBe( 3 );
// 		expect( junction.getConnection( 3 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 3 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 4 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 4 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 4 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 5 ).incomingRoadId ).toBe( 3 );
// 		expect( junction.getConnection( 5 ).laneLink.length ).toBe( 2 );
// 		expect( junction.getConnection( 5 ).isCornerConnection ).toBe( true );


// 	} );

// 	it( 'should work for 4-way-junction for one-way roads', () => {


// 		// 				ROAD:4
// 		//				^ ^ ^ ^ ^
// 		// 			| 1	 |	-1	| -2 |
// 		// 			|	 |		| 	 |
// 		// 			|	 |		|	 |
// 		// ROAD:1	|	 | 		|	 |	ROAD:2
// 		// ------->						------->
// 		// 1	>						 1
// 		// ------->						------->
// 		// -1	>						 -1
// 		// ------->						------->
// 		// -2	>						 -2
// 		// ------->						------->
// 		//					^^^
// 		// 			| 1	 |	-1	| -2 |
// 		// 			|	 |		| 	 |
// 		// 			|	 |		|	 |
// 		// 			|	 | 		|	 |
// 		// 			ROAD:3

// 		const left = baseTest.createOneWayRoad( roadService, [ new Vector2( -50, 0 ), new Vector2( 50, 0 ) ] );
// 		const right = baseTest.createOneWayRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ] );
// 		const bottom = baseTest.createOneWayRoad( roadService, [ new Vector2( 0, -100 ), new Vector2( 0, -50 ) ] );
// 		const top = baseTest.createOneWayRoad( roadService, [ new Vector2( 0, 50 ), new Vector2( 0, 100 ) ] );

// 		const coords = [
// 			left.getEndPosTheta().toRoadCoord( left ),
// 			right.getStartPosTheta().toRoadCoord( right ),
// 			bottom.getEndPosTheta().toRoadCoord( bottom ),
// 			top.getStartPosTheta().toRoadCoord( top ),
// 		];

// 		const junction = intersectionManager.createJunctionFromCoords( coords );

// 		expect( junction ).toBeDefined();
// 		expect( junction.getConnectionCount() ).toBe( 12 );

// 		mapService.roads.forEach( road => road.laneSections.forEach( section => {
// 			if ( !section.areRightLanesInOrder() ) {
// 				throw new Error( 'Right lanes are not in order' );
// 			}
// 		} ) )

// 		expect( junction.getConnection( 0 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 0 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 0 ).isCornerConnection ).toBe( undefined );
// 		expect( junction.getConnection( 0 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
// 		expect( junction.getConnection( 0 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( -1 );
// 		expect( junction.getConnection( 0 ).laneLink[ 0 ].connectingLane.successorId ).toBe( -1 );

// 		expect( junction.getConnection( 1 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 1 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 1 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 2 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 2 ).isCornerConnection ).toBe( true );
// 		expect( junction.getConnection( 2 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 2 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 2 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( -2 );
// 		expect( junction.getConnection( 2 ).laneLink[ 0 ].connectingLane.successorId ).toBe( 1 );

// 		expect( junction.getConnection( 3 ).incomingRoadId ).toBe( 3 );
// 		expect( junction.getConnection( 3 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 3 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 4 ).incomingRoadId ).toBe( 1 );
// 		expect( junction.getConnection( 4 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 4 ).isCornerConnection ).toBe( undefined );
// 		expect( junction.getConnection( 4 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
// 		expect( junction.getConnection( 4 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( -1 );
// 		expect( junction.getConnection( 4 ).laneLink[ 0 ].connectingLane.successorId ).toBe( -1 );

// 		expect( junction.getConnection( 5 ).incomingRoadId ).toBe( 4 );
// 		expect( junction.getConnection( 5 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 5 ).isCornerConnection ).toBe( true );
// 		expect( junction.getConnection( 5 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 5 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( 1 );
// 		expect( junction.getConnection( 5 ).laneLink[ 0 ].connectingLane.successorId ).toBe( 1 );

// 		expect( junction.getConnection( 6 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 6 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 6 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 7 ).incomingRoadId ).toBe( 3 );
// 		expect( junction.getConnection( 7 ).laneLink.length ).toBe( 2 );
// 		expect( junction.getConnection( 7 ).isCornerConnection ).toBe( true );
// 		expect( junction.getConnection( 7 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
// 		expect( junction.getConnection( 7 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( -1 );
// 		expect( junction.getConnection( 7 ).laneLink[ 0 ].connectingLane.successorId ).toBe( -1 );
// 		expect( junction.getConnection( 7 ).laneLink[ 1 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 7 ).laneLink[ 1 ].connectingLane.predecessorId ).toBe( -2 );
// 		expect( junction.getConnection( 7 ).laneLink[ 1 ].connectingLane.successorId ).toBe( -2 );

// 		expect( junction.getConnection( 8 ).incomingRoadId ).toBe( 2 );
// 		expect( junction.getConnection( 8 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 8 ).isCornerConnection ).toBe( true );
// 		expect( junction.getConnection( 8 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.sidewalk );
// 		expect( junction.getConnection( 8 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( 1 );
// 		expect( junction.getConnection( 8 ).laneLink[ 0 ].connectingLane.successorId ).toBe( -2 );

// 		expect( junction.getConnection( 9 ).incomingRoadId ).toBe( 4 );
// 		expect( junction.getConnection( 9 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 9 ).isCornerConnection ).toBe( undefined );

// 		expect( junction.getConnection( 10 ).incomingRoadId ).toBe( 3 );
// 		expect( junction.getConnection( 10 ).laneLink.length ).toBe( 1 );
// 		expect( junction.getConnection( 10 ).isCornerConnection ).toBe( undefined );
// 		expect( junction.getConnection( 10 ).laneLink[ 0 ].connectingLane.type ).toBe( TvLaneType.driving );
// 		expect( junction.getConnection( 10 ).laneLink[ 0 ].connectingLane.predecessorId ).toBe( -1 );
// 		expect( junction.getConnection( 10 ).laneLink[ 0 ].connectingLane.successorId ).toBe( -1 );

// 		expect( junction.getConnection( 11 ).incomingRoadId ).toBe( 4 );
// 		expect( junction.getConnection( 11 ).laneLink.length ).toBe( 0 );
// 		expect( junction.getConnection( 11 ).isCornerConnection ).toBe( undefined );


// 	} );


// } );
