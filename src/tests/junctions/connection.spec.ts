import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { DepIntersectionService } from 'app/deprecated/dep-intersection.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector3 } from 'three';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { DepConnectionFactory } from "../../app/map/junction/dep-connection.factory";


xdescribe( 'ConnectionService', () => {

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


	it( 'should create connection with same road same direction', inject( [ RoadService, JunctionService, DepConnectionFactory ], (
		roadService: RoadService,
		junctionService: JunctionService,
		connectionService: DepConnectionFactory,
	) => {

		const leftRoad = roadService.createDefaultRoad();
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		leftRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -10, 0, 0 ) ) );

		const rightRoad = roadService.createDefaultRoad();
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );
		rightRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 40, 0, 0 ) ) );

		roadService.add( leftRoad );
		roadService.add( rightRoad );

		expect( leftRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 7 );
		expect( rightRoad.getLaneProfile().getFirstLaneSection().getLaneCount() ).toBe( 7 );

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

		expect( connection.connectingRoad.id ).toBe( 3 );

		expect( connection.connectingRoad.predecessor ).toBeDefined();
		expect( connection.connectingRoad.predecessor.id ).toBe( leftRoad.id );
		expect( connection.connectingRoad.predecessor.isRoad ).toBe( true )
		expect( connection.connectingRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( connection.connectingRoad.successor ).toBeDefined();
		expect( connection.connectingRoad.successor.id ).toBe( rightRoad.id );
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

	it( 'should give correct contact side', inject( [ RoadService, DepIntersectionService, JunctionService ], (
		roadService: RoadService,
		intersectionService: DepIntersectionService,
		junctionService: JunctionService,
	) => {

		base.createFourWayJunction( roadService, intersectionService );

		const junction = junctionService.getJunctionById( 1 );

		const left = roadService.getRoad( 1 );
		const bottom = roadService.getRoad( 2 );
		const top = roadService.getRoad( 3 );
		const right = roadService.getRoad( 4 );

		expect( roadService.roads.length ).toBe( 4 + 12 );

		expect( junction.getConnectionCount() ).toBe( 12 );

		expect( junction.getConnection( 0 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.getConnection( 0 ).incomingRoad.id ).toBe( bottom.id );
		expect( junction.getConnection( 0 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );


		expect( junction.getConnection( 1 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.getConnection( 1 ).incomingRoad.id ).toBe( left.id );
		expect( junction.getConnection( 1 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );

		expect( junction.getConnection( 2 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.getConnection( 2 ).incomingRoad.id ).toBe( bottom.id );
		expect( junction.getConnection( 2 ).getIncomingContactPoint() ).toBe( TvContactPoint.END );

		expect( junction.getConnection( 3 ).contactPoint ).toBe( TvContactPoint.START );
		expect( junction.getConnection( 3 ).incomingRoad.id ).toBe( top.id );
		expect( junction.getConnection( 3 ).getIncomingContactPoint() ).toBe( TvContactPoint.START );

		// TODO: add more tests for rest of the connections


	} ) );

} );
