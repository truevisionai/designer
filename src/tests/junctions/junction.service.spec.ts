import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { JunctionService } from 'app/services/junction/junction.service';
import { RoadService } from 'app/services/road/road.service';
import { Vector2 } from 'three';

describe( 'JunctionService', () => {

	let roadService: RoadService;
	let junctionService: JunctionService;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		roadService = TestBed.inject( RoadService );
		junctionService = TestBed.inject( JunctionService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();
	} );

	it( 'should create junction from coords of different road', () => {

		const roadA = roadService.getRoadFactory().createFromControlPoints( [ new Vector2( 0, 0 ), new Vector2( 10, 0 ) ] );
		const roadB = roadService.getRoadFactory().createFromControlPoints( [ new Vector2( 20, 0 ), new Vector2( 30, 0 ) ] );

		roadService.add( roadA );
		roadService.add( roadB );

		const junction = junctionService.createFromCoords( [ roadA.getRoadCoordAt( 10 ), roadB.getRoadCoordAt( 0 ) ] );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );

		for ( const connection of junction.getConnections() ) {

			expect( connection.connectingRoad.length ).toBeCloseTo( 10 );
			expect( connection.laneLink.length ).toBe( 3 );

		}

	} );

	it( 'should create junction from coords of same road', () => {

		const roadA = roadService.getRoadFactory().createFromControlPoints( [ new Vector2( 0, 0 ), new Vector2( 100, 0 ) ] );

		roadService.add( roadA );

		const junction = junctionService.createFromCoords( [ roadA.getRoadCoordAt( 50 ), roadA.getRoadCoordAt( 60 ) ] );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 2 );
		expect( roadService.roads.length ).toBe( 4 );

		for ( const connection of junction.getConnections() ) {

			expect( connection.connectingRoad.length ).toBeCloseTo( 10 );
			expect( connection.laneLink.length ).toBe( 3 );

		}

	} );

} );
