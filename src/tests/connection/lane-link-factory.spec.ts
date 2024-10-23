import { JunctionFactory } from "../../app/factories/junction.factory";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { TestBed } from "@angular/core/testing";
import { setupTest } from "tests/setup-tests";
import { Vector3 } from "three";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { createMockLeftConnection, createMockRightConnection, createMockStraightConnection } from "tests/mocks/connection-mock.spec";
import { LaneLinkFactory } from "../../app/factories/lane-link-factory";
import { RoadFactory } from "../../app/factories/road-factory.service";
import { TvMap } from "app/map/models/tv-map.model";
import { createOneWayRoad } from "tests/base-test.spec";
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

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

			expect( connection ).toBeDefined();

			const links = createLinks( connection );

			expect( links.length ).toBe( 3 );

			expect( links.map( link => link.from ) ).toEqual( [ -1, -2, -3 ] );

			expect( links.map( link => link.to ) ).toEqual( [ -1, -2, -3 ] );

		} );

		it( 'should create links for right turn with start and start contact', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad, TvContactPoint.START, TvContactPoint.START );

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

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

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

			incomingRoad = createOneWayRoad();
			outgoingRoad = createOneWayRoad();

			const map = new TvMap();

			map.addRoad( incomingRoad );
			// map.addRoad( outgoingRoad );

		} );

		it( 'should create links for right turn', () => {

			connection = createMockRightConnection( incomingRoad, outgoingRoad );

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

} );

function createLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

	return LaneLinkFactory.generateLinks( connection );

}

