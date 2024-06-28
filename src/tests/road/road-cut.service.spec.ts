import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { RoadService } from 'app/services/road/road.service';
import { SplineBuilder } from 'app/services/spline/spline.builder';
import { Vector3 } from 'three';

describe( 'Service: RoadCut', () => {

	let eventServiceProvider: EventServiceProvider;
	let splineBuilder: SplineBuilder;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

		splineBuilder = TestBed.inject( SplineBuilder );

	} );

	it( 'should ...', inject( [ RoadService ], ( roadService: RoadService ) => {

		expect( roadService ).toBeTruthy();

	} ) );

	it( 'should cut straight road in middle', inject( [ RoadService, RoadDividerService ], ( roadService: RoadService, roadDividerService: RoadDividerService ) => {

		const oldRoad = roadService.createDefaultRoad();

		oldRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		oldRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 50, 0, 0 ) ) );

		roadService.add( oldRoad );

		expect( oldRoad.length ).toBe( 100 );

		const newRoad = roadDividerService.cutRoadFromTo( oldRoad, 40, 60 );

		expect( oldRoad ).toBeDefined();
		expect( newRoad ).toBeDefined();

		expect( oldRoad.spline.segmentMap.size ).toBe( 3 );
		expect( oldRoad.sStart ).toBe( 0 );
		expect( newRoad.sStart ).toBe( 60 );

		roadService.add( newRoad );
		splineBuilder.buildSpline( oldRoad.spline );

		expect( oldRoad.length ).toBe( 40 );
		expect( newRoad.length ).toBe( 40 );

		expect( oldRoad.geometries.length ).toBe( 1 );
		expect( newRoad.geometries.length ).toBe( 1 );

	} ) );

	it( 'should cut straight road in end', inject( [ RoadService, RoadDividerService ], ( roadService: RoadService, roadDividerService: RoadDividerService ) => {

		const oldRoad = roadService.createDefaultRoad();

		oldRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		oldRoad.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 0, 0 ) ) );

		roadService.add( oldRoad );

		expect( oldRoad.length ).toBe( 50 );

		const newRoad = roadDividerService.cutRoadFromTo( oldRoad, 40, 60 );

		expect( oldRoad ).toBeDefined();
		expect( newRoad ).not.toBeDefined();

		expect( oldRoad.spline.segmentMap.size ).toBe( 2 );
		expect( oldRoad.sStart ).toBe( 0 );

		splineBuilder.buildSpline( oldRoad.spline );

		expect( oldRoad.length ).toBe( 40 );

		expect( oldRoad.geometries.length ).toBe( 1 );

	} ) );


} );
