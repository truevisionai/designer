import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector2, Vector3 } from 'three';

describe( 'Service: RoadDivider', () => {

	let base: BaseTest = new BaseTest;
	let eventServiceProvider: EventServiceProvider;
	let roadService: RoadService;
	let roadDividerService: RoadDividerService;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		eventServiceProvider = TestBed.get( EventServiceProvider );
		eventServiceProvider.init();

		roadService = TestBed.get( RoadService );
		roadDividerService = TestBed.get( RoadDividerService );

	} );

	it( 'should divide straight road in middle', () => {

		// const road = roadService.createDefaultRoad();
		// road.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		// road.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );
		// roadService.addRoad( road );

		const road = base.createDefaultRoad( roadService, [
			new Vector2( -50, 0 ),
			new Vector2( 50, 0 ),
		] );

		expect( road.length ).toBe( 100 );

		const newRoad = roadDividerService.divideRoadAt( road, 50 );

		roadService.add( newRoad );

		expect( newRoad ).toBeDefined();
		expect( newRoad.sStart ).toBe( 50 );
		expect( newRoad.length ).toBe( 50 );

		expect( road ).toBeDefined();
		expect( road.sStart ).toBe( 0 );
		expect( road.length ).toBe( 50 );

		expect( newRoad.geometries.length ).toBe( 1 );
		expect( newRoad.geometries[ 0 ].s ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].x ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].y ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].length ).toBe( 50 );

		expect( road.geometries.length ).toBe( 1 );
		expect( road.geometries[ 0 ].s ).toBe( 0 );
		expect( road.geometries[ 0 ].x ).toBe( -50 );
		expect( road.geometries[ 0 ].y ).toBe( 0 );
		expect( road.geometries[ 0 ].length ).toBe( 50 );

		expect( road.successor ).toBeDefined();
		expect( road.successor.elementId ).toBe( newRoad.id );
		expect( road.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( newRoad.predecessor ).toBeDefined();
		expect( newRoad.predecessor.elementId ).toBe( road.id );
		expect( newRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );


	} );

	it( 'should divide straight road multiple times', () => {

		const road1 = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 500, 0 ),
		] );

		expect( road1.length ).toBe( 500 );

		const road2 = roadDividerService.divideRoadAt( road1, 300 );
		roadService.add( road2 );

		const road3 = roadDividerService.divideRoadAt( road1, 100 );
		roadService.add( road3 );

		expect( road1.successor.element ).toBe( road3 )
		expect( road1.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( road2.predecessor.element ).toBe( road3 );
		expect( road2.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( road3.predecessor.element ).toBe( road1 );
		expect( road3.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( road1.length ).toBe( 100 );
		expect( road2.length ).toBe( 200 );
		expect( road3.length ).toBe( 200 );

	} );

} );
