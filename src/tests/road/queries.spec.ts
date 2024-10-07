import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RoadService } from 'app/services/road/road.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TvRoad } from "../../app/map/models/tv-road.model";
import { TvLaneSection } from "../../app/map/models/tv-lane-section";
import { RoadDistance } from 'app/map/road/road-distance';

describe( 'RoadService: Queries', () => {

	let roadService: RoadService;
	let road: TvRoad;
	let laneSection: TvLaneSection;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		roadService = TestBed.inject( RoadService );

		road = roadService.roadFactory.createDefaultRoad();

		laneSection = road.laneSections[ 0 ];

		road.getPlanView().addGeometryLine( 0, 0, 0, 0, 100 );

	} );

	it( 'should create service', () => {

		expect( roadService ).toBeTruthy();

	} );

	it( 'should find correct position for center lane at 0', () => {

		const position = road.getLaneCenterPosition( laneSection.getLaneById( 0 ), 0 as RoadDistance );

		expect( position.x ).toEqual( 0 );
		expect( position.y ).toEqual( 0 );
		expect( position.z ).toEqual( 0 );
		expect( position.s ).toEqual( 0 );
		expect( position.t ).toEqual( 0 );

	} );

	it( 'should find correct position for center lane at 10', () => {

		const position = road.getLaneCenterPosition( laneSection.getLaneById( 0 ), 10 as RoadDistance );

		expect( position.x ).toEqual( 10 );
		expect( position.y ).toEqual( 0 );
		expect( position.z ).toEqual( 0 );
		expect( position.s ).toEqual( 10 );
		expect( position.t ).toEqual( 0 );

	} );

	it( 'should find correct position for right lane at 0', () => {

		const right1 = laneSection.getLaneById( -1 );

		const width = right1.getWidthValue( 0 );

		const position = road.getLaneCenterPosition( right1, 0 as RoadDistance );

		const expected = -( 1.8 );

		expect( width ).toBe( 3.6 );
		expect( position.x ).toBeCloseTo( 0 );
		expect( position.y ).toEqual( expected );
		expect( position.z ).toEqual( 0 );
		expect( position.s ).toEqual( 0 );
		expect( position.t ).toEqual( expected );

	} );

	it( 'should find correct position for right-2 lane at 0', () => {

		const right1 = laneSection.getLaneById( -1 );
		const right2 = laneSection.getLaneById( -2 );

		const width = right2.getWidthValue( 0 );

		const position = road.getLaneCenterPosition( right2, 0 as RoadDistance );

		const expected = -( 3.6 + 0.25 );

		expect( width ).toBe( 0.5 );
		expect( position.x ).toBeCloseTo( 0 );
		expect( position.y ).toBeCloseTo( expected );
		expect( position.z ).toEqual( 0 );
		expect( position.s ).toEqual( 0 );
		expect( position.t ).toBeCloseTo( expected );

	} );

} );
