import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { LaneSectionFactory } from "app/factories/lane-section.factory";
import { MapService } from "app/services/map.service";
import { RoadService } from "app/services/road/road.service";
import { BaseTest } from "tests/base-test.spec";
import { Vector2 } from "three";

fdescribe( 'LaneSectionFactory: tests', () => {

	let base: BaseTest = new BaseTest;
	let factory: LaneSectionFactory;
	let mapService: MapService;
	let roadService: RoadService;


	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ LaneSectionFactory ]
		} );


		factory = TestBed.inject( LaneSectionFactory );
		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );

	} );

	beforeEach( () => {

		//

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

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessor ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessor ).toBe( -1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).succcessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).succcessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).succcessor ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).succcessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).succcessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).succcessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).succcessor ).toBe( -1 );


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

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessor ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessor ).toBe( -1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).succcessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).succcessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).succcessor ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).succcessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).succcessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).succcessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).succcessor ).toBe( 1 );


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

		expect( laneSections[ 0 ].getLaneById( 3 ).predecessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).predecessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).predecessor ).toBe( -1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).predecessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).predecessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).predecessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).predecessor ).toBe( 1 );

		expect( laneSections[ 0 ].getLaneById( 3 ).succcessor ).toBe( 3 );
		expect( laneSections[ 0 ].getLaneById( 2 ).succcessor ).toBe( 2 );
		expect( laneSections[ 0 ].getLaneById( 1 ).succcessor ).toBe( 1 );
		expect( laneSections[ 0 ].getLaneById( 0 ).succcessor ).toBe( 0 );
		expect( laneSections[ 0 ].getLaneById( -3 ).succcessor ).toBe( -3 );
		expect( laneSections[ 0 ].getLaneById( -2 ).succcessor ).toBe( -2 );
		expect( laneSections[ 0 ].getLaneById( -1 ).succcessor ).toBe( -1 );

	} );

} );
