import { TestBed } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LaneSectionFactory } from "./lane-section.factory";
import { RoadFactory } from "./road-factory.service";
import { Vector3 } from "three";
import { TvRoadLink, TvRoadLinkType } from "../map/models/tv-road-link";
import { TvContactPoint } from "../map/models/tv-common";

describe( 'LaneSectionFactory', () => {

	let factory: LaneSectionFactory;
	let roadFactory: RoadFactory;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ LaneSectionFactory ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		factory = TestBed.inject( LaneSectionFactory );
		roadFactory = TestBed.inject( RoadFactory );
	} );

	it( 'should create correctly', () => {
		expect( factory ).toBeTruthy();
	} );

	it( 'should create for joining road', () => {

		// setup
		const roadA = roadFactory.createStraightRoad( new Vector3( -100, 0, 0 ), 0, 50 );
		const roadB = roadFactory.createStraightRoad( new Vector3( 50, 0, 0 ), 0, 50 );
		const joiningRoad = roadFactory.createStraightRoad( new Vector3( -50, 0, 0 ), 0, 100 );
		const aEnd = new TvRoadLink( TvRoadLinkType.ROAD, roadA, TvContactPoint.END );
		const bStart = new TvRoadLink( TvRoadLinkType.ROAD, roadB, TvContactPoint.START );

		const laneSection = factory.createForJoiningRoad( joiningRoad, aEnd, bStart )[ 0 ];

		// both roads have 7 lanes
		// 3 on each side and 1 center lane
		expect( roadA.laneSections[ 0 ].lanes.size ).toBe( 7 );
		expect( roadB.laneSections[ 0 ].lanes.size ).toBe( 7 );

		expect( laneSection ).toBeDefined();
		expect( laneSection.lanes.size ).toBe( 7 );
		expect( laneSection.areLeftLanesInOrder() ).toBeTrue();
		expect( laneSection.areRightLanesInOrder() ).toBeTrue();
		expect( roadA.laneSections[ 0 ].isMatching( laneSection ) );

	} );

} )