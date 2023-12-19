import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
import { RoadService } from 'app/services/road/road.service';
import { Vector3 } from 'three';

describe( 'Service: RoadSpline', () => {

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule ]
		} );
	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should make line geometry with 4 straight points', inject( [ RoadService ], ( roadService: RoadService ) => {

		const road = roadService.createDefaultRoad();

		road.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		road.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );
		road.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );
		road.spline.addControlPointAt( new Vector3( 150, 0, 0 ) );

		roadService.addRoad( road );

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
