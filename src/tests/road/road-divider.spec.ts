import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { RoadService } from 'app/services/road/road.service';
import { Vector3 } from 'three';

describe( 'Service: RoadDivider', () => {

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule ]
		} );
	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should divide straight road in middle', inject( [ RoadService ], ( roadService: RoadService ) => {

		const road = roadService.createDefaultRoad();

		road.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		road.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		roadService.addRoad( road );

		expect( road.length ).toBe( 100 );

		const newRoad = roadService.divideRoadAt( road, 50 );

		roadService.addRoad( newRoad );

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


	} ) );


} );
