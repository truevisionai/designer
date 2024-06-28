import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LaneSectionFactory } from "app/factories/lane-section.factory";
import { TvLaneType } from "app/map/models/tv-common";
import { MapValidatorService } from "app/services/map/map-validator.service";
import { MapService } from "app/services/map/map.service";
import { RoadService } from "app/services/road/road.service";
import { BaseTest } from "tests/base-test.spec";
import { Vector2 } from "three";

describe( 'LaneSectionFactory: tests', () => {

	let base: BaseTest = new BaseTest;
	let factory: LaneSectionFactory;
	let mapService: MapService;
	let roadService: RoadService;
	let mapValidator: MapValidatorService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ LaneSectionFactory ]
		} );

		factory = TestBed.inject( LaneSectionFactory );
		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		mapValidator = TestBed.get( MapValidatorService );

	} );


	it( 'should find next lane correctly', () => {

		const road = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );

		expect( road.laneSections[ 0 ].lanes.size ).toBe( 7 );

		const laneSection = road.laneSections[ 0 ];

		// expect( laneSection.getNearestLane( laneSection.getLaneById( 4 ) )?.id ).toBe( 3 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( 3 ) )?.id ).toBe( 3 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( 2 ) )?.id ).toBe( 2 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( 1 ) )?.id ).toBe( 1 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( -1 ) )?.id ).toBe( -1 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( -2 ) )?.id ).toBe( -2 );
		expect( laneSection.getNearestLane( laneSection.getLaneById( -3 ) )?.id ).toBe( -3 );
		// expect( laneSection.getNearestLane( laneSection.getLaneById( -4 ) )?.id ).toBe( -3 );

	} );

	it( 'should work when similar roads in same direction', () => {

		// Road directions
		// ------>| -> |------>

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );
		const roadB = base.createDefaultRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ] );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 7 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );
		expect( laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( laneSections[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( laneSections[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).successorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).successorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).successorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -3 ).successorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).successorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );


	} );

	it( 'should work when simliar roads facing each other', () => {

		// Road directions
		// ------>| -> |<------

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );
		const roadB = base.createDefaultRoad( roadService, [ new Vector2( 200, 0 ), new Vector2( 100, 0 ) ] );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 7 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getEndPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );
		expect( laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( laneSections[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( laneSections[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessorId ).toBe( 1 );
		// expect( laneSections[ 0 ].getLaneById( 0 ).predecessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).successorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).successorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).successorId ).toBe( -1 );
		// expect( laneSections[ 0 ].getLaneById( 0 ).succcessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).successorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).successorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).successorId ).toBe( 1 );


	} );

	it( 'should work when simliar roads in opposite direction', () => {

		// Road directions
		// <-----| -> |----->

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 50, 0 ), new Vector2( 0, 0 ) ] );
		const roadB = base.createDefaultRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 200, 0 ) ] );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 7 );

		const coordA = roadA.getStartPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );
		expect( laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( laneSections[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( laneSections[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessorId ).toBe( -1 );
		// expect( laneSections[ 0 ].getLaneById( 0 ).predecessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessorId ).toBe( 1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).successorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).successorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).successorId ).toBe( 1 );
		// expect( laneSections[ 0 ].getLaneById( 0 ).succcessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).successorId ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).successorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );

	} );

	it( 'should work when different roads with same direction 4 lane with 2 lane', () => {

		// Road directions - 4 lanes with 2 lanes
		// <------| <-
		// <------| <- |<------
		// >>>>>>>>>>>>>>>>>>>>
		// ------>| -> |------>
		// ------>| ->

		const roadA = base.createRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ], 2, 2 );
		const roadB = base.createRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ], 1, 1 );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 5 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 3 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );

		expect( laneSections[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( laneSections[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( laneSections[ 0 ].lanes.size ).toBe( 5 );
		expect( laneSections[ 0 ].getLeftLaneCount() ).toBe( 2 );
		expect( laneSections[ 0 ].getRightLaneCount() ).toBe( 2 );

		expect( laneSections[ 0 ].getLaneById( 2 ).type ).toBe( TvLaneType.driving );
		expect( laneSections[ 0 ].getLaneById( 1 ).type ).toBe( TvLaneType.driving );
		expect( laneSections[ 0 ].getLaneById( 0 ).type ).toBe( TvLaneType.none );
		expect( laneSections[ 0 ].getLaneById( -1 ).type ).toBe( TvLaneType.driving );
		expect( laneSections[ 0 ].getLaneById( -2 ).type ).toBe( TvLaneType.driving );

		expect( laneSections[ 0 ].getLaneById( 2 ).predecessorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessorId ).toBe( -2 );

		expect( laneSections[ 0 ].getLaneById( 2 ).successorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 1 ).successorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( -2 ).successorId ).toBe( -1 );

	} );

	it( 'should work when different roads with same direction 2 lane with 4 lane', () => {

		// Road directions - 2 lane with 4 lanes
		//
		//
		// 		  | <- |<------
		// <------| <- |<------
		// >>>>>>>>>>>>>>>>>>>>
		// ------>| -> |------>
		// 		  | -> |------>

		const roadA = base.createRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ], 1, 1 );
		const roadB = base.createRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ], 2, 2 );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 3 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 5 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );

		const laneSection = laneSections[ 0 ];

		expect( laneSection.areLeftLanesInOrder() ).toBe( true );
		expect( laneSection.areRightLanesInOrder() ).toBe( true );

		expect( laneSection.lanes.size ).toBe( 5 );
		expect( laneSection.getLeftLaneCount() ).toBe( 2 );
		expect( laneSection.getRightLaneCount() ).toBe( 2 );

		expect( laneSection.getLaneById( 2 ).type ).toBe( TvLaneType.driving );
		expect( laneSection.getLaneById( 1 ).type ).toBe( TvLaneType.driving );
		expect( laneSection.getLaneById( 0 ).type ).toBe( TvLaneType.none );
		expect( laneSection.getLaneById( -1 ).type ).toBe( TvLaneType.driving );
		expect( laneSection.getLaneById( -2 ).type ).toBe( TvLaneType.driving );

		expect( laneSection.getLaneById( 2 ).predecessorId ).toBe( 1 );
		expect( laneSection.getLaneById( 1 ).predecessorId ).toBe( 1 );
		expect( laneSection.getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( laneSection.getLaneById( -1 ).predecessorId ).toBe( -1 );
		expect( laneSection.getLaneById( -2 ).predecessorId ).toBe( -1 );

		expect( laneSection.getLaneById( 2 ).successorId ).toBe( 2 );
		expect( laneSection.getLaneById( 1 ).successorId ).toBe( 1 );
		expect( laneSection.getLaneById( 0 ).successorId ).toBe( undefined );
		expect( laneSection.getLaneById( -1 ).successorId ).toBe( -1 );
		expect( laneSection.getLaneById( -2 ).successorId ).toBe( -2 );

	} );

	it( 'should work when different roads with same direction 7 lane with 2 lane', () => {

		// Road directions - 7 lanes with 2 lanes
		// <------| <-
		// <------| <-
		// <------| <- |<------
		// >>>>>>>>>>>>>>>>>>>>
		// ------>| -> |------>
		// ------>| ->
		// ------>| ->

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );
		const roadB = base.createRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ], 1, 1 );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 3 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const laneSections = factory.createFromRoadCoord( roadB, coordA, coordB );

		expect( laneSections.length ).toBe( 1 );

		expect( laneSections[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( laneSections[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( laneSections[ 0 ].lanes.size ).toBe( 7 );
		expect( laneSections[ 0 ].getLeftLaneCount() ).toBe( 3 );
		expect( laneSections[ 0 ].getRightLaneCount() ).toBe( 3 );

		expect( laneSections[ 0 ].getLaneById( 3 ).type ).toBe( TvLaneType.sidewalk );
		expect( laneSections[ 0 ].getLaneById( 2 ).type ).toBe( TvLaneType.shoulder );
		expect( laneSections[ 0 ].getLaneById( 1 ).type ).toBe( TvLaneType.driving );
		expect( laneSections[ 0 ].getLaneById( 0 ).type ).toBe( TvLaneType.none );
		expect( laneSections[ 0 ].getLaneById( -1 ).type ).toBe( TvLaneType.driving );
		expect( laneSections[ 0 ].getLaneById( -2 ).type ).toBe( TvLaneType.shoulder );
		expect( laneSections[ 0 ].getLaneById( -3 ).type ).toBe( TvLaneType.sidewalk );

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessorId ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessorId ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessorId ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessorId ).toBe( -3 );

		expect( laneSections[ 0 ].getLaneById( 3 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( 2 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( 1 ).successorId ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( -2 ).successorId ).toBe( undefined );
		expect( laneSections[ 0 ].getLaneById( -3 ).successorId ).toBe( undefined );

	} );

	it( 'should work when similar roads in same direction for junction', () => {

		// Road directions
		// ------>| -> |------>

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );
		const roadB = base.createDefaultRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ] );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 7 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const leftToRight = factory.createForConnectingRoad( roadB, coordA, coordB );

		expect( leftToRight.length ).toBe( 1 );
		expect( leftToRight[ 0 ].lanes.size ).toBe( 4 );

		expect( leftToRight[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( leftToRight[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( leftToRight[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( leftToRight[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );
		expect( leftToRight[ 0 ].getLaneById( -2 ).predecessorId ).toBe( -2 );
		expect( leftToRight[ 0 ].getLaneById( -3 ).predecessorId ).toBe( -3 );

		expect( leftToRight[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( leftToRight[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );
		expect( leftToRight[ 0 ].getLaneById( -2 ).successorId ).toBe( -2 );
		expect( leftToRight[ 0 ].getLaneById( -3 ).successorId ).toBe( -3 );

		const rightToLeft = factory.createForConnectingRoad( roadB, coordB, coordA );

		expect( rightToLeft.length ).toBe( 1 );
		expect( rightToLeft[ 0 ].lanes.size ).toBe( 4 );

		expect( rightToLeft[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( rightToLeft[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( rightToLeft[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( rightToLeft[ 0 ].getLaneById( -1 ).predecessorId ).toBe( 1 );
		expect( rightToLeft[ 0 ].getLaneById( -2 ).predecessorId ).toBe( 2 );
		expect( rightToLeft[ 0 ].getLaneById( -3 ).predecessorId ).toBe( 3 );

		expect( rightToLeft[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( rightToLeft[ 0 ].getLaneById( -1 ).successorId ).toBe( 1 );
		expect( rightToLeft[ 0 ].getLaneById( -2 ).successorId ).toBe( 2 );
		expect( rightToLeft[ 0 ].getLaneById( -3 ).successorId ).toBe( 3 );

	} );

	it( 'should work when different roads with same direction 7 lane with 2 lane for junction', () => {

		// Road directions - 7 lanes with 2 lanes
		// <------| <-
		// <------| <-
		// <------| <- |<------
		// >>>>>>>>>>>>>>>>>>>>
		// ------>| -> |------>
		// ------>| ->
		// ------>| ->

		const roadA = base.createDefaultRoad( roadService, [ new Vector2( 0, 0 ), new Vector2( 50, 0 ) ] );
		const roadB = base.createRoad( roadService, [ new Vector2( 100, 0 ), new Vector2( 150, 0 ) ], 1, 1 );

		expect( roadA.laneSections.length ).toBe( 1 );
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( roadB.laneSections.length ).toBe( 1 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 3 );

		const coordA = roadA.getEndPosTheta().toRoadCoord( roadA );
		const coordB = roadB.getStartPosTheta().toRoadCoord( roadB );

		const leftToRight = factory.createForConnectingRoad( roadB, coordA, coordB );

		expect( leftToRight.length ).toBe( 1 );

		expect( leftToRight[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( leftToRight[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( leftToRight[ 0 ].lanes.size ).toBe( 2 );
		expect( leftToRight[ 0 ].getLeftLaneCount() ).toBe( 0 );
		expect( leftToRight[ 0 ].getRightLaneCount() ).toBe( 1 );

		expect( leftToRight[ 0 ].getLaneById( 0 ).type ).toBe( TvLaneType.none );
		expect( leftToRight[ 0 ].getLaneById( -1 ).type ).toBe( TvLaneType.driving );
		// expect( leftToRight[ 0 ].getLaneById( -2 ).type ).toBe( TvLaneType.shoulder );
		// expect( leftToRight[ 0 ].getLaneById( -3 ).type ).toBe( TvLaneType.sidewalk );

		expect( leftToRight[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( leftToRight[ 0 ].getLaneById( -1 ).predecessorId ).toBe( -1 );
		// expect( leftToRight[ 0 ].getLaneById( -2 ).predecessor ).toBe( -2 );
		// expect( leftToRight[ 0 ].getLaneById( -3 ).predecessor ).toBe( -3 );

		expect( leftToRight[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( leftToRight[ 0 ].getLaneById( -1 ).successorId ).toBe( -1 );
		// expect( leftToRight[ 0 ].getLaneById( -2 ).succcessor ).toBe( undefined );
		// expect( leftToRight[ 0 ].getLaneById( -3 ).succcessor ).toBe( undefined );

		const rightToLeft = factory.createForConnectingRoad( roadB, coordB, coordA );

		expect( rightToLeft.length ).toBe( 1 );

		expect( rightToLeft[ 0 ].areLeftLanesInOrder() ).toBe( true );
		expect( rightToLeft[ 0 ].areRightLanesInOrder() ).toBe( true );

		expect( rightToLeft[ 0 ].lanes.size ).toBe( 2 );
		expect( rightToLeft[ 0 ].getLeftLaneCount() ).toBe( 0 );
		expect( rightToLeft[ 0 ].getRightLaneCount() ).toBe( 1 );

		expect( rightToLeft[ 0 ].getLaneById( 0 ).type ).toBe( TvLaneType.none );
		expect( rightToLeft[ 0 ].getLaneById( -1 ).type ).toBe( TvLaneType.driving );
		// expect( rightToLeft[ 0 ].getLaneById( -2 ).type ).toBe( TvLaneType.shoulder );
		// expect( rightToLeft[ 0 ].getLaneById( -3 ).type ).toBe( TvLaneType.sidewalk );

		expect( rightToLeft[ 0 ].getLaneById( 0 ).predecessorId ).toBe( undefined );
		expect( rightToLeft[ 0 ].getLaneById( -1 ).predecessorId ).toBe( 1 );
		// expect( rightToLeft[ 0 ].getLaneById( -2 ).predecessor ).toBe( undefined );
		// expect( rightToLeft[ 0 ].getLaneById( -3 ).predecessor ).toBe( undefined );

		expect( rightToLeft[ 0 ].getLaneById( 0 ).successorId ).toBe( undefined );
		expect( rightToLeft[ 0 ].getLaneById( -1 ).successorId ).toBe( 1 );
		// expect( rightToLeft[ 0 ].getLaneById( -2 ).succcessor ).toBe( 2 );
		// expect( rightToLeft[ 0 ].getLaneById( -3 ).succcessor ).toBe( 3 );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( true );

	} );

} );
