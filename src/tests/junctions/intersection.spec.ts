import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { DepIntersectionService } from 'app/deprecated/dep-intersection.service';
import { RoadService } from 'app/services/road/road.service';
import { Maths } from 'app/utils/maths';
import { Vector3 } from 'three';

xdescribe( 'IntersectionService', () => {

	let roadService: RoadService;
	let intersectionService: DepIntersectionService;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( DepIntersectionService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();
	} );

	it( 'should detect intersection', () => {

		const roadA = roadService.createDefaultRoad();
		roadA.getPlanView().addGeometryLine( 0, -50, 0, 0, 100 );

		const roadB = roadService.createDefaultRoad();
		roadB.getPlanView().addGeometryLine( 0, 0, -50, Maths.PI2, 50 );

		const intersection = intersectionService.getRoadIntersectionPoint( roadA, roadB );

		expect( intersection ).toBeDefined();
		expect( intersection.x ).toBeCloseTo( 0 );
		expect( intersection.y ).toBeCloseTo( 0 );
		expect( intersection.z ).toBeCloseTo( 0 );

	} );

	it( 'should detect intersection on elevated roads', () => {

		const roadA = roadService.createDefaultRoad();
		roadA.getElevationProfile().createAndAddElevation( 0, 10, 0, 0, 0 );
		roadA.getPlanView().addGeometryLine( 0, -50, 0, 0, 100 );

		const roadB = roadService.createDefaultRoad();
		roadB.getElevationProfile().createAndAddElevation( 0, 10, 0, 0, 0 );
		roadB.getPlanView().addGeometryLine( 0, 0, -50, Maths.PI2, 50 );

		const intersection = intersectionService.getRoadIntersectionPoint( roadA, roadB );

		expect( intersection ).toBeDefined();
		expect( intersection.x ).toBeCloseTo( 0 );
		expect( intersection.y ).toBeCloseTo( 0 );
		expect( intersection.z ).toBeCloseTo( 10 );

	} );

	it( 'should not detect intersection if one road is elevated', () => {

		const roadA = roadService.createDefaultRoad();
		roadA.getPlanView().addGeometryLine( 0, -50, 0, 0, 100 );

		const roadB = roadService.createDefaultRoad();
		roadB.getElevationProfile().createAndAddElevation( 0, 10, 0, 0, 0 );
		roadB.getPlanView().addGeometryLine( 0, 0, -50, Maths.PI2, 50 );

		const intersection = intersectionService.getRoadIntersectionPoint( roadA, roadB );

		expect( intersection ).not.toBeDefined();

	} );

	it( 'should not detect intersection when elevation is different', () => {

		const roadA = roadService.createDefaultRoad();
		roadA.getElevationProfile().createAndAddElevation( 0, 5, 0, 0, 0 );
		roadA.getPlanView().addGeometryLine( 0, -50, 0, 0, 100 );

		const roadB = roadService.createDefaultRoad();
		roadB.getElevationProfile().createAndAddElevation( 0, 10, 0, 0, 0 );
		roadB.getPlanView().addGeometryLine( 0, 0, -50, Maths.PI2, 50 );

		const intersection = intersectionService.getRoadIntersectionPoint( roadA, roadB );

		expect( intersection ).not.toBeDefined();

	} );

	it( 'should detect intersection of road with splines', () => {

		// left to right
		const road1 = roadService.createDefaultRoad();
		road1.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -50, 0, 0 ) ) );
		road1.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 50, 0, 0 ) ) );

		// bottom to top
		const road2 = roadService.createDefaultRoad();
		road2.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, -50, 0 ) ) );
		road2.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, 50, 0 ) ) );

		roadService.add( road1 );
		roadService.add( road2 );

		const intersection = intersectionService.getRoadIntersectionPoint( road1, road2 );

		expect( intersection ).toBeDefined();
		expect( intersection.x ).toBeCloseTo( 0 );
		expect( intersection.y ).toBeCloseTo( 0 );
		expect( intersection.z ).toBeCloseTo( 0 );

	} );

} );
