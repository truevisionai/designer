import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
import { RoadService } from 'app/services/road/road.service';
import { BaseTest } from 'tests/base-test.spec';
import { Vector2 } from 'three';

describe( 'Service: RoadSpline', () => {

	let base: BaseTest = new BaseTest;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule ]
		} );
		eventServiceProvider = TestBed.get( EventServiceProvider );
		eventServiceProvider.init();
	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should make line geometry with 4 straight points', inject( [ RoadService ], ( roadService: RoadService ) => {

		const road = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 50, 0 ),
			new Vector2( 100, 0 ),
			new Vector2( 150, 0 ),
		] )

		expect( road.geometries.length ).toBe( 3 );

		expect( road.geometries[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.geometries[ 1 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.geometries[ 2 ].geometryType ).toBe( TvGeometryType.LINE );

		expect( road.geometries[ 0 ].length ).toBe( 50 );
		expect( road.geometries[ 1 ].length ).toBe( 50 );
		expect( road.geometries[ 2 ].length ).toBe( 50 );

		expect( road.length ).toBe( 150 );


	} ) );


} );
