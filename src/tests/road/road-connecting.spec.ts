import { TestBed, inject } from '@angular/core/testing';
import { RoadNode } from 'app/objects/road/road-node';
import { TvContactPoint } from 'app/map/models/tv-common';
import { RoadToolHelper } from 'app/tools/road/road-tool-helper.service';
import { Vector2 } from 'app/core/maths';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { setupTest } from 'tests/setup-tests';

describe( 'RoadTool: Connecting Roads', () => {

	let service: RoadToolHelper;
	let helper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		service = TestBed.inject( RoadToolHelper );
		helper = TestBed.inject( SplineTestHelper );

	} );

	it( 'should connect roads', () => {

		const prevRoad = helper.createDefaultRoad( [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ] );
		const nextRoad = helper.createDefaultRoad( [ new Vector2( 200, 0 ), new Vector2( 300, 0 ) ] );

		const prevNode = new RoadNode( prevRoad, TvContactPoint.END );
		const nextNode = new RoadNode( nextRoad, TvContactPoint.START );

		const joiningRoad = service.createJoiningRoad( prevNode, nextNode );

		expect( joiningRoad ).toBeDefined();
		expect( joiningRoad.spline.getControlPointCount() ).toBe( 4 );
		expect( joiningRoad.spline.getLength() ).toBeCloseTo( 100 );

		expect( joiningRoad.getPredecessor().isRoad ).toBe( true );
		expect( joiningRoad.getPredecessor().equals( prevRoad ) ).toBeTrue();
		expect( joiningRoad.getPredecessor().contactPoint ).toBe( TvContactPoint.END );

		expect( joiningRoad.successor.isRoad ).toBe( true );
		expect( joiningRoad.successor.equals( nextRoad ) ).toBeTrue();
		expect( joiningRoad.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( prevRoad.successor.isRoad ).toBe( true );
		expect( prevRoad.successor.equals( joiningRoad ) ).toBeTrue();
		expect( prevRoad.successor.contactPoint ).toBe( TvContactPoint.START );
		expect( prevRoad.predecessor ).toBeUndefined();

		expect( nextRoad.getPredecessor().isRoad ).toBe( true );
		expect( nextRoad.getPredecessor().equals( joiningRoad ) ).toBeTrue();
		expect( nextRoad.getPredecessor().contactPoint ).toBe( TvContactPoint.END );
		expect( nextRoad.successor ).toBeUndefined();

	} );

} );
