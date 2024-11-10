import { TestBed } from "@angular/core/testing";
import { JunctionFactory } from "app/factories/junction.factory";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TurnType, TvContactPoint } from "app/map/models/tv-common";
import { TvMap } from "app/map/models/tv-map.model";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { createFreewayOneWayRoad, createOneWayRoad } from "tests/base-test.spec";
import { createMockLeftConnection, createMockRightConnection, createMockStraightConnection } from "tests/mocks/connection-mock.spec";
import { setupTest } from "tests/setup-tests";
import { Vector3 } from "three";
import { determineTurnType } from "app/map/models/connections/connection-utils";

describe( 'TvJunctionConnection', () => {

	let helper: SplineTestHelper;
	let connection: TvJunctionConnection;
	let junction: TvJunction;

	let incomingRoad: TvRoad;
	let outgoingRoad: TvRoad;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

		junction = JunctionFactory.create();

		incomingRoad = helper.addStraightRoad( new Vector3( 0, 0, 0 ), 50 )
		outgoingRoad = helper.addStraightRoad( new Vector3( 60, 0, 0 ), 50 );

		incomingRoad.spline.updateSegmentGeometryAndBounds();
		outgoingRoad.spline.updateSegmentGeometryAndBounds();

	} );

	describe( 'Determine Turn Type Correctly', () => {

		it( 'should return right turn', () => {

			const entry = incomingRoad.getEndCoord();
			const exit = outgoingRoad.getStartCoord();

			// ensure splines dont match
			incomingRoad.spline.uuid = 'incoming';
			outgoingRoad.spline.uuid = 'outgoing';

			expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );
			expect( determineTurnType( exit, entry ) ).toBe( TurnType.STRAIGHT );

		} );

	} );

	describe( 'DefaultRoad', () => {

		it( 'should get entry coords for right turn with end and start contact', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ -1 ] );

			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -1 ] );

		} );

		it( 'should get entry coords for right turn with with start and start contact', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad, TvContactPoint.START );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ 1 ] );

			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -1 ] );

		} );

		it( 'should get exit coords for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -1 ] );

		} );

		it( 'should get entry coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ) );

		} );

		it( 'should get exit coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -1 ] );

		} );

		it( 'should get entry coords for left turn connection end/start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.START );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -1 ] );

		} );

		it( 'should get exit coords for left turn connection end/end', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.END );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords().map( coord => coord.lane.id ) ).toEqual( [ -1 ] );

			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ 1 ] );

		} );

	} );

	describe( 'HighwayRoad', () => {

		beforeEach( () => {

			incomingRoad = RoadFactory.makeRoad( { id: 1, leftLaneCount: 3, rightLaneCount: 3 } );
			outgoingRoad = RoadFactory.makeRoad( { id: 2, leftLaneCount: 3, rightLaneCount: 3 } );

			const map = new TvMap();

			map.addRoad( incomingRoad );
			map.addRoad( outgoingRoad );

		} );

		it( 'should get entry coords for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -3 ) );

		} );

		it( 'should get exit coords for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -3 ] );

		} );

		it( 'should get entry coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 3 );
			expect( connection.getEntryCoords().map( coord => coord.lane.id ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should get exit coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 3 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should get entry coords for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -1 ) );

		} );

		it( 'should get exit coords for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -1 ] );

		} );

	} );

	describe( 'OneWay-HighwayRoad', () => {

		beforeEach( () => {

			incomingRoad = createFreewayOneWayRoad( { id: 1 } );
			outgoingRoad = createFreewayOneWayRoad( { id: 2 } );

			const map = new TvMap();

			map.addRoad( incomingRoad );

		} );

		it( 'should get entry/exit coords for right turn end/start', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.START );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().map( coord => coord.lane.id ) ).toEqual( [ -5 ] );

			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -5 ] );

		} );

		it( 'should get entry/exit coords for right turn with start/start', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().length ).toEqual( 0 );
			// should probably be 0 because the road is one way
			expect( connection.getExitCoords().length ).toEqual( 1 );


		} );

		xit( 'should get exit coords for right turn', () => {

			// connection = createMockRightConnection( incomingRoad, outgoingRoad );

			// expect( connection ).toBeDefined();
			// expect( connection.getEntryCoords().length ).toBe( 2 );
			// expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -4 ) );
			// expect( connection.getEntryCoords()[ 1 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -5 ) );

		} );

		it( 'should get entry coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().map( coord => coord.lane.id ) ).toEqual( [ -2, -3, -4, -5 ] );

			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -2, -3, -4, -5 ] );

		} );

		xit( 'should get exit coords for straight connection', () => {

			// connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			// expect( connection ).toBeDefined();
			// expect( connection.getEntryCoords().length ).toBe( 3 );
			// expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -2 ) );
			// expect( connection.getEntryCoords()[ 1 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -3 ) );
			// expect( connection.getEntryCoords()[ 2 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -4 ) );

		} );

		it( 'should get entry/exit coords for straight turn with start/start', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().length ).toEqual( 0 );

			expect( connection.getExitCoords().length ).toEqual( 4 );

		} );

		it( 'should get entry coords for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().map( coord => coord.lane.id ) ).toEqual( [ -2 ] );

			expect( connection.getExitCoords().map( coord => coord.lane.id ) ).toEqual( [ -2 ] );

		} );

		xit( 'should get exit coords for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().length ).toBe( 1 );

			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -2 ) );

		} );

		it( 'should get entry/exit coords for left turn with start/start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			expect( connection ).toBeDefined();

			expect( connection.getEntryCoords().length ).toBe( 0 );

			// expect( connection.getExitCoords().length ).toBe( 0 );

		} );

	} );

	describe( 'OneWayRoad', () => {

		beforeEach( () => {

			incomingRoad = createOneWayRoad();
			outgoingRoad = createOneWayRoad();

			const map = new TvMap();

			map.addRoad( incomingRoad );

		} );

		it( 'should get entry coords for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ -3 ] );

		} );

		it( 'should get exit coords for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -3 ] );

		} );

		it( 'should get entry coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -3 ) );

		} );

		it( 'should get exit coords for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -3 ] );

		} );

		it( 'should get lanes from left turn', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getEntryCoords().length ).toBe( 1 );
			expect( connection.getEntryCoords()[ 0 ].lane ).toEqual( incomingRoad.getLaneProfile().getFirstLaneSection().getLaneById( -3 ) );


		} );

		it( 'should get exit coords for left turn', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();
			expect( connection.getExitCoords().length ).toBe( 1 );
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ -3 ] );


		} );

	} );

	describe( 'OneWayRoad With MultiLaneRoad', () => {

		xit( 'should get entry coords for right turn' );
		xit( 'should get exit coords for right turn' );

		xit( 'should get entry coords for straight connection' );
		xit( 'should get exit coords for straight connection' );

		xit( 'should get lanes from left turn' );
		xit( 'should get exit from left turn' );

	} );

} );


