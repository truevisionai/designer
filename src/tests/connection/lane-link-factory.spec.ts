import { JunctionFactory } from "../../app/factories/junction.factory";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { TestBed } from "@angular/core/testing";
import { setupTest } from "tests/setup-tests";
import { Vector3 } from "app/core/maths"
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import {
	createCornerConnection,
	createMockLeftConnection,
	createMockRightConnection,
	createMockStraightConnection
} from "tests/mocks/connection-mock.spec";
import { LaneLinkFactory } from "../../app/factories/lane-link-factory";
import { RoadFactory } from "../../app/factories/road-factory.service";
import { TvMap } from "app/map/models/tv-map.model";
import { createDefaultRoad, createFreewayOneWayRoad, createFreewayRoad, createOneWayRoad } from "tests/base-test.spec";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvContactPoint } from "app/map/models/tv-common";

describe( 'LaneLinkFactory', () => {

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

	describe( 'DefaultRoad', () => {

		it( 'should create links for right turn with end and start contact', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 3 );

			expect( links.map( link => link.from ) ).toEqual( [ -1, -2, -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for right turn with start and start contact', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 3 );

			expect( links.map( link => link.from ) ).toEqual( [ 1, 2, 3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for straight turn with end and start contact', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 1 );

			expect( links.map( link => link.from ) ).toEqual( [ -1 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for straight turn with start and start contact', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 1 );

			expect( links.map( link => link.from ) ).toEqual( [ 1 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for left turn', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 1 );

			expect( links.map( link => link.from ) ).toEqual( [ -1 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

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

		it( 'should create links for right turn', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -1, -2, -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -1 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

	} );

	describe( 'OneWayRoad', () => {

		beforeEach( () => {

			incomingRoad = createOneWayRoad( { id: 1 } );
			outgoingRoad = createOneWayRoad( { id: 2 } );

			const map = new TvMap();

			map.addRoad( incomingRoad );
			map.addRoad( outgoingRoad );

		} );

		it( 'should create links for right turn', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3, -4, -5 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

	} );

	describe( 'OneWayRoad With Default', () => {

		beforeEach( () => {

			incomingRoad = createOneWayRoad();
			outgoingRoad = createDefaultRoad();

			const map = new TvMap();

			map.addRoad( incomingRoad );
			map.addRoad( outgoingRoad );

		} );

		it( 'should create links for right turn', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3, -4, -5 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for right turn with not driving connection', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2, -1 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2 ] );

		} );

		it( 'should create links for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for left turn connection', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

	} );

	describe( 'OneWay-HighwayRoad', () => {

		beforeEach( () => {

			incomingRoad = createFreewayOneWayRoad( { id: 1 } );
			outgoingRoad = createFreewayOneWayRoad( { id: 2 } );

			const map = new TvMap();

			map.addRoad( incomingRoad );

		} );

		it( 'should create links for right turn', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -5, -6 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2 ] );

		} );

		it( 'should create links for right turn with end / end', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.END );

			const links = createLinks( connection );

			// expect( links.map( link => link.from ) ).toEqual( [ -6 ] );
			// expect( links.map( link => link.to ) ).toEqual( [ -1 ] );
			// expect( links.map( link => link.connectingLane.successorId ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for straight connection', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2, -3, -4, -5 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3, -4 ] );

		} );

		it( 'should create links for left turn connection with end / start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1 ] );

		} );

		it( 'should create links for left turn connection with start / start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.END );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [] );

			expect( links.map( link => link.to ) ).toEqual( [] );

		} );

	} );

	describe( 'Freeway', () => {

		beforeEach( () => {

			incomingRoad = createFreewayRoad();
			outgoingRoad = createFreewayRoad();

			const map = new TvMap();

			map.addRoad( incomingRoad );

		} );

		it( 'should create links for straight turn', () => {

			connection = createMockStraightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2, -3, -4, -5 ] );

		} );

		it( 'should create links for right turn end/start', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -5 ] );

		} );

		it( 'should create links for right turn start/start', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ 5 ] );

			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ 5 ] );

		} );

		it( 'should create links for left turn end/start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2 ] );

		} );

		it( 'should create links for left turn start/start', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ 2 ] );

			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ 2 ] );

		} );

		it( 'should create links for left turn end/end', () => {

			connection = createMockLeftConnection( incomingRoad, outgoingRoad, TvContactPoint.END, TvContactPoint.END );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -2 ] );

			expect( connection.getEntryCoords().map( entry => entry.lane.id ) ).toEqual( [ -2 ] );
			expect( connection.getExitCoords().map( exit => exit.lane.id ) ).toEqual( [ 2 ] );

		} );

		it( 'should create links for corner-right turn', () => {

			connection = createCornerConnection( incomingRoad, outgoingRoad );

			const links = createLinks( connection );

			expect( links.map( link => link.from ) ).toEqual( [ -5, -6 ] );

		} );

	} );

} );

function createLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

	return LaneLinkFactory.createLinks( connection );

}

