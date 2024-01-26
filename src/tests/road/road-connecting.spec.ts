import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { RoadNode } from 'app/objects/road-node';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoadLinkChildType } from 'app/map/models/tv-road-link-child';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector2 } from 'three';

describe( 'RoadTool: Connecting Roads', () => {

	let tool: RoadTool;
	let base: BaseTest = new BaseTest;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should connect roads', inject( [ RoadToolService ], ( roadToolService: RoadToolService ) => {

		const leftRoad = base.createDefaultRoad( roadToolService.roadService, [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ] );
		const rightRoad = base.createDefaultRoad( roadToolService.roadService, [ new Vector2( 200, 0 ), new Vector2( 300, 0 ) ] );

		const leftNode = new RoadNode( leftRoad, TvContactPoint.END );
		const rightNode = new RoadNode( rightRoad, TvContactPoint.START );

		const joiningRoad = roadToolService.createJoiningRoad( leftNode, rightNode );

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

	} ) );




} );
