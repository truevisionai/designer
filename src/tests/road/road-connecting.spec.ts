import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { RoadNode } from 'app/objects/road-node';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolHelper } from 'app/tools/road/road-tool-helper.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector2 } from 'three';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe( 'RoadTool: Connecting Roads', () => {

	let tool: RoadTool;
	let base: BaseTest = new BaseTest;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolHelper ) )

	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should connect roads', inject( [ RoadToolHelper ], ( roadToolService: RoadToolHelper ) => {

		const leftRoad = base.createDefaultRoad( roadToolService.roadService, [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ] );
		const rightRoad = base.createDefaultRoad( roadToolService.roadService, [ new Vector2( 200, 0 ), new Vector2( 300, 0 ) ] );

		const leftNode = new RoadNode( leftRoad, TvContactPoint.END );
		const rightNode = new RoadNode( rightRoad, TvContactPoint.START );

		const joiningRoad = roadToolService.createJoiningRoad( leftNode, rightNode );

		expect( joiningRoad ).toBeDefined();
		expect( joiningRoad.spline.controlPoints.length ).toBe( 4 );
		expect( joiningRoad.spline.getLength() ).toBeCloseTo( 100 );

		expect( joiningRoad.predecessor.type ).toBe( TvRoadLinkType.road );
		expect( joiningRoad.predecessor.id ).toBe( leftRoad.id );
		expect( joiningRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( joiningRoad.successor.type ).toBe( TvRoadLinkType.road );
		expect( joiningRoad.successor.id ).toBe( rightRoad.id );
		expect( joiningRoad.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( leftRoad.successor.type ).toBe( TvRoadLinkType.road );
		expect( leftRoad.successor.id ).toBe( joiningRoad.id );
		expect( leftRoad.successor.contactPoint ).toBe( TvContactPoint.START );
		expect( leftRoad.predecessor ).toBeUndefined();

		expect( rightRoad.predecessor.type ).toBe( TvRoadLinkType.road );
		expect( rightRoad.predecessor.id ).toBe( joiningRoad.id );
		expect( rightRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );
		expect( rightRoad.successor ).toBeUndefined();

	} ) );




} );
