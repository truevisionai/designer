import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { RoadService } from 'app/services/road/road.service';
import { Vector3 } from 'three';

describe( 'Service: RoadCut', () => {

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule ]
		} );
	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should cut straight road in middle', inject( [ RoadService ], ( roadService: RoadService ) => {

		const oldRoad = roadService.createDefaultRoad();

		oldRoad.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		oldRoad.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		roadService.addRoad( oldRoad );

		expect( oldRoad.length ).toBe( 100 );

		const newRoad = roadService.cutRoadFromTo( oldRoad, 40, 60 );

		expect( oldRoad ).toBeDefined();
		expect( newRoad ).toBeDefined();

		expect( oldRoad.spline.getRoadSegments().length ).toBe( 3 );
		expect( oldRoad.sStart ).toBe( 0 );
		expect( newRoad.sStart ).toBe( 60 );

		roadService.addRoad( newRoad );
		roadService.buildSpline( oldRoad.spline );

		expect( oldRoad.length ).toBe( 40 );
		expect( newRoad.length ).toBe( 40 );

		expect( oldRoad.geometries.length ).toBe( 1 );
		expect( newRoad.geometries.length ).toBe( 1 );

	} ) );

	it( 'should cut straight road in end', inject( [ RoadService ], ( roadService: RoadService ) => {

		const oldRoad = roadService.createDefaultRoad();

		oldRoad.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		oldRoad.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );

		roadService.addRoad( oldRoad );

		expect( oldRoad.length ).toBe( 50 );

		const newRoad = roadService.cutRoadFromTo( oldRoad, 40, 60 );

		expect( oldRoad ).toBeDefined();
		expect( newRoad ).not.toBeDefined();

		expect( oldRoad.spline.getRoadSegments().length ).toBe( 2 );
		expect( oldRoad.sStart ).toBe( 0 );

		roadService.buildSpline( oldRoad.spline );

		expect( oldRoad.length ).toBe( 40 );

		expect( oldRoad.geometries.length ).toBe( 1 );

	} ) );


} );
