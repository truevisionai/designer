import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { IntersectionService } from 'app/services/junction/intersection.service';
import { ConnectionService } from 'app/map/junction/connection/connection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector3 } from 'three';
import { SplineControlPoint } from 'app/objects/spline-control-point';

describe( 'ConnectionService', () => {

	let base: BaseTest = new BaseTest();
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should create junction with same road same direction', inject( [ RoadService, JunctionService ], (
		roadService: RoadService,
		junctionService: JunctionService
	) => {

		const leftRoad = roadService.createDefaultRoad();
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -10, 0, 0 ) ) );

		const rightRoad = roadService.createDefaultRoad();
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 40, 0, 0 ) ) );

		roadService.add( leftRoad );
		roadService.add( rightRoad );

		expect( leftRoad.getFirstLaneSection().getLaneCount() ).toBe( 7 );
		expect( rightRoad.getFirstLaneSection().getLaneCount() ).toBe( 7 );

		expect( leftRoad.length ).toBe( 40 );
		expect( rightRoad.length ).toBe( 40 );

		const junction = junctionService.createJunctionFromContact(
			leftRoad, TvContactPoint.END,
			rightRoad, TvContactPoint.START
		);

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );

		expect( leftRoad.predecessor ).toBeUndefined();
		expect( leftRoad.successor ).toBeDefined()
		expect( leftRoad.successor.elementId ).toBe( junction.id );

		expect( rightRoad.successor ).toBeUndefined();
		expect( rightRoad.predecessor ).toBeDefined()
		expect( rightRoad.predecessor.elementId ).toBe( junction.id );

		// expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( leftRoad.id );
		// expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( rightRoad.id );
		// expect( junction.connections.get( 0 ).laneLink.length ).toBe( 3 );

		// expect( junction.connections.get( 0 ).laneLink[ 0 ].from ).toBe( -1 );
		// expect( junction.connections.get( 0 ).laneLink[ 0 ].to ).toBe( -1 );
		// expect( junction.connections.get( 0 ).laneLink[ 1 ].from ).toBe( -2 );
		// expect( junction.connections.get( 0 ).laneLink[ 1 ].to ).toBe( -2 );
		// expect( junction.connections.get( 0 ).laneLink[ 2 ].from ).toBe( -3 );
		// expect( junction.connections.get( 0 ).laneLink[ 2 ].to ).toBe( -3 );

		// expect( junction.connections.get( 1 ).incomingRoad.id ).toBe( rightRoad.id );
		// expect( junction.connections.get( 1 ).outgoingRoad.id ).toBe( leftRoad.id );
		// expect( junction.connections.get( 1 ).laneLink.length ).toBe( 3 );

		// expect( junction.connections.get( 1 ).laneLink[ 0 ].from ).toBe( -1 );
		// expect( junction.connections.get( 1 ).laneLink[ 0 ].to ).toBe( -1 );
		// expect( junction.connections.get( 1 ).laneLink[ 1 ].from ).toBe( -2 );
		// expect( junction.connections.get( 1 ).laneLink[ 1 ].to ).toBe( -2 );
		// expect( junction.connections.get( 1 ).laneLink[ 2 ].from ).toBe( -3 );
		// expect( junction.connections.get( 1 ).laneLink[ 2 ].to ).toBe( -3 );

	} ) );

	it( 'should create connection with same road same direction', inject( [ RoadService, JunctionService, ConnectionService ], (
		roadService: RoadService,
		junctionService: JunctionService,
		connectionService: ConnectionService,
	) => {

		const leftRoad = roadService.createDefaultRoad();
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -10, 0, 0 ) ) );

		const rightRoad = roadService.createDefaultRoad();
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 40, 0, 0 ) ) );

		roadService.add( leftRoad );
		roadService.add( rightRoad );

		expect( leftRoad.getFirstLaneSection().getLaneCount() ).toBe( 7 );
		expect( rightRoad.getFirstLaneSection().getLaneCount() ).toBe( 7 );

		expect( leftRoad.length ).toBe( 40 );
		expect( rightRoad.length ).toBe( 40 );

		const junction = junctionService.createNewJunction();

		const incoming = leftRoad.getEndPosTheta().toRoadCoord( leftRoad );
		const outgoing = rightRoad.getStartPosTheta().toRoadCoord( rightRoad );

		const connection = connectionService.createConnection( junction, incoming, outgoing );

		expect( connection ).toBeDefined();
		expect( connection.id ).toBe( 0 );
		expect( connection.contactPoint ).toBe( TvContactPoint.START );
		expect( connection.incomingRoad.id ).toBe( leftRoad.id );
		expect( connection.outgoingRoad.id ).toBe( rightRoad.id );

		expect( connection.connectingRoad.id ).toBe( 3 );

		expect( connection.connectingRoad.predecessor ).toBeDefined();
		expect( connection.connectingRoad.predecessor.elementId ).toBe( leftRoad.id );
		expect( connection.connectingRoad.predecessor.isRoad ).toBe( true )
		expect( connection.connectingRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( connection.connectingRoad.successor ).toBeDefined();
		expect( connection.connectingRoad.successor.elementId ).toBe( rightRoad.id );
		expect( connection.connectingRoad.successor.isRoad ).toBe( true )
		expect( connection.connectingRoad.successor.contactPoint ).toBe( TvContactPoint.START );

		// expect( connection.laneLink.length ).toBe( 3 );
		// expect( connection.laneLink[ 0 ].from ).toBe( -1 );
		// expect( connection.laneLink[ 0 ].to ).toBe( -1 );
		// expect( connection.laneLink[ 1 ].from ).toBe( -2 );
		// expect( connection.laneLink[ 1 ].to ).toBe( -2 );
		// expect( connection.laneLink[ 2 ].from ).toBe( -3 );
		// expect( connection.laneLink[ 2 ].to ).toBe( -3 );

	} ) );

	it( 'should give correct contact side', inject( [ RoadService, IntersectionService, JunctionService ], (
		roadService: RoadService,
		intersectionService: IntersectionService,
		junctionService: JunctionService,
	) => {

		base.createFourWayJunction( roadService, intersectionService );

		const junction = junctionService.getJunctionById( 1 );

		const left = roadService.getRoad( 1 );
		const bottom = roadService.getRoad( 2 );
		const top = roadService.getRoad( 3 );
		const right = roadService.getRoad( 4 );

		expect( roadService.roads.length ).toBe( 4 + 12 );

		expect( junction.connections.size ).toBe( 12 );

		expect( junction.connections.get( 0 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( bottom.id );
		expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( left.id );
		expect( junction.connections.get( 0 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );
		expect( junction.connections.get( 0 ).getOutgoingContactPoint() ).toBe( TvContactPoint.END );

		expect( junction.connections.get( 1 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.connections.get( 1 ).incomingRoad.id ).toBe( left.id );
		expect( junction.connections.get( 1 ).outgoingRoad.id ).toBe( bottom.id );
		expect( junction.connections.get( 1 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );
		expect( junction.connections.get( 1 ).getOutgoingContactPoint() ).toBe( TvContactPoint.END );

		expect( junction.connections.get( 2 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.connections.get( 2 ).incomingRoad.id ).toBe( bottom.id );
		expect( junction.connections.get( 2 ).outgoingRoad.id ).toBe( top.id );
		expect( junction.connections.get( 2 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );
		expect( junction.connections.get( 2 ).getOutgoingContactPoint() ).toBe( TvContactPoint.START );

		expect( junction.connections.get( 3 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.connections.get( 3 ).incomingRoad.id ).toBe( top.id );
		expect( junction.connections.get( 3 ).outgoingRoad.id ).toBe( bottom.id );
		expect( junction.connections.get( 3 ).getIncomingContactPoint() ).toBe( TvContactPoint.START );
		expect( junction.connections.get( 3 ).getOutgoingContactPoint() ).toBe( TvContactPoint.END );

		// TODO: add more tests for rest of the connections


	} ) );

} );
