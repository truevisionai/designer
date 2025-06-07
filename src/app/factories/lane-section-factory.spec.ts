/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LaneSectionFactory } from "./lane-section.factory";
import { RoadFactory } from "./road-factory.service";
import { Vector3 } from "app/core/maths"
import { LinkFactory } from 'app/map/models/link-factory';
import { TvContactPoint } from "../map/models/tv-common";
import { TvLaneSection } from "../map/models/tv-lane-section";

xdescribe( 'LaneSectionFactory', () => {

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
		const aEnd = LinkFactory.createRoadLink( roadA, TvContactPoint.END );
		const bStart = LinkFactory.createRoadLink( roadB, TvContactPoint.START );

		const laneSection = factory.createForJoiningRoad( joiningRoad, aEnd, bStart )[ 0 ];

		// both roads have 7 lanes
		// 3 on each side and 1 center lane
		expect( roadA.laneSections[ 0 ].getLaneCount() ).toBe( 7 );
		expect( roadB.laneSections[ 0 ].getLaneCount() ).toBe( 7 );

		expect( laneSection ).toBeDefined();
		expect( laneSection.getLaneCount() ).toBe( 7 );
		expect( laneSection.areLeftLanesInOrder() ).toBeTrue();
		expect( laneSection.areRightLanesInOrder() ).toBeTrue();
		expect( roadA.laneSections[ 0 ].isMatching( laneSection ) );

	} );

	it( 'should create section for 2-lane-road with 4-lane-road', () => {

		const previousRoad = RoadFactory.makeRoad( {
			leftLaneCount: 1,
			rightLaneCount: 1,
		} );

		const nextRoad = RoadFactory.makeRoad( {
			leftLaneCount: 2,
			leftWidth: 2,
			rightLaneCount: 2,
			rightWidth: 2
		} );

		const newLaneSections = LaneSectionFactory.createFromRoadCoord(
			previousRoad.getEndCoord(),
			nextRoad.getStartCoord()
		);

		expect( newLaneSections.length ).toBe( 2 );

		expect( newLaneSections[ 0 ].getLaneCount() ).toBe( 3 );
		expect( newLaneSections[ 0 ].getNonCenterLanes().map( lane => lane.predecessorId ) ).toEqual( [ 1, -1 ] );
		expect( newLaneSections[ 0 ].getNonCenterLanes().map( lane => lane.successorId ) ).toEqual( [ 1, -1 ] );

		previousRoad.getEndCoord().laneSection.getNonCenterLanes().forEach( lane => {
			expect( lane.successorId ).toBe( lane.id );
		} )

		expect( newLaneSections[ 1 ].getLaneCount() ).toBe( 5 );
		expect( newLaneSections[ 1 ].getNonCenterLanes().map( lane => lane.predecessorId ) ).toEqual( [ undefined, 1, -1, undefined ] );
		expect( newLaneSections[ 1 ].getNonCenterLanes().map( lane => lane.successorId ) ).toEqual( [ 2, 1, -1, -2 ] );

		nextRoad.getStartCoord().laneSection.getNonCenterLanes().forEach( lane => {
			expect( lane.predecessorId ).toBe( lane.id );
		} )

	} );

	it( 'should create section and match lane-widths 2-lane-road with 4-lane-road', () => {

		const previousRoad = RoadFactory.makeRoad( {
			leftLaneCount: 1,
			rightLaneCount: 1,
		} );

		const nextRoad = RoadFactory.makeRoad( {
			leftLaneCount: 1,
			rightLaneCount: 1,
			leftWidth: 2,
			rightWidth: 2
		} );

		spyOn( TvLaneSection.prototype, 'getLength' ).and.returnValue( 100 );

		const laneSections = LaneSectionFactory.createFromRoadCoord(
			previousRoad.getEndCoord(),
			nextRoad.getStartCoord()
		);

		expect( laneSections.length ).toBe( 1 );

		expect( laneSections[ 0 ].getNonCenterLanes().map( lane => lane.getLaneWidthCount() ) ).toEqual( [ 2, 2 ] );

		expect( laneSections[ 0 ].getNonCenterLanes().map( lane => lane.getWidthValue( 0 ) ) ).toEqual( [ 3.6, 3.6 ] );

	} );

} )
