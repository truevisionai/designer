import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AutoSplineV2 } from "app/core/shapes/auto-spline-v2";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { SplineManager } from "app/managers/spline-manager";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { SplineControlPoint } from "app/objects/spline-control-point";
import { RoadService } from "app/services/road/road.service";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector3 } from "three";

describe( 'SplineToGeometry test', () => {

	let splineFactory: SplineFactory;
	let pointFactory: ControlPointFactory;
	let roadService: RoadService;
	let eventServiceProvider: EventServiceProvider;
	let splineManager: SplineManager;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineManager = TestBed.inject( SplineManager );
		splineFactory = TestBed.inject( SplineFactory );
		pointFactory = TestBed.inject( ControlPointFactory );
		roadService = TestBed.inject( RoadService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	it( 'should create line geometry from a spline with 2 points', () => {

		const spline = new AutoSplineV2();

		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 0, 0 ) ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 100, 0, 0 ) ) );

		splineManager.addSpline( spline );

		const geometry = spline.geometries[ 0 ];

		expect( geometry.s ).toBe( 0 );
		expect( geometry.x ).toBe( 0 );
		expect( geometry.y ).toBe( 0 );
		expect( geometry.hdg ).toBe( 0 );
		expect( geometry.length ).toBe( 100 );

	} )

	it( 'should create line geometry from a spline with 3 points', () => {

		const spline = new AutoSplineV2();

		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 0, 0 ) ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 100, 0, 0 ) ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 200, 0, 0 ) ) );

		splineManager.addSpline( spline );

		const exportGeometries = spline.geometries;

		expect( exportGeometries.length ).toBe( 1 );

		expect( exportGeometries[ 0 ].s ).toBe( 0 );
		expect( exportGeometries[ 0 ].x ).toBe( 0 );
		expect( exportGeometries[ 0 ].y ).toBe( 0 );
		expect( exportGeometries[ 0 ].hdg ).toBe( 0 );
		expect( exportGeometries[ 0 ].length ).toBe( 200 );

	} )

	it( 'should create geometries from a connecting road spline', () => {

		// meeting a 90 degree turn

		const v1 = new TvPosTheta( -50, 0, 0 );
		const v2 = new TvPosTheta( 0, -50, Math.PI / 2 );

		const spline = splineFactory.createSpline( v1.position, v1.toDirectionVector(), v2.position, v2.toDirectionVector() );

		splineManager.addSpline( spline );

		const exportGeometries = spline.geometries;

		expect( exportGeometries.length ).toBe( 4 );

		expect( exportGeometries[ 0 ].s ).toBe( 0 );
		expect( exportGeometries[ 0 ].x ).toBe( -50 );
		expect( exportGeometries[ 0 ].y ).toBe( 0 );
		expect( exportGeometries[ 0 ].hdg ).toBe( 0 );

		for ( let i = 1; i < exportGeometries.length; i++ ) {

			const geometry = exportGeometries[ i ];

			expect( geometry.s ).toBeDefined();
			expect( geometry.x ).toBeDefined();
			expect( geometry.y ).toBeDefined();
			expect( geometry.hdg ).toBeDefined();
			expect( geometry.length ).toBeDefined();

			if ( geometry instanceof TvArcGeometry ) {
				expect( geometry.radius ).toBeDefined();
				expect( geometry.curvature ).toBeDefined();
			}

		}

	} )

	it( 'should create geometries for automated junction', () => {

		const vertical = roadService.createDefaultRoad()
		vertical.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 0, -100, 0 ) ) );
		vertical.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 50, 100, 0 ) ) );
		roadService.add( vertical );

		const horizontal = roadService.createDefaultRoad()
		horizontal.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( -100, 0, 0 ) ) );
		horizontal.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( 100, 0, 0 ) ) );
		roadService.add( horizontal );

		splineManager.addSpline( vertical.spline );

		// expect( roadService.roads.length ).toBe( 16 );

		for ( let road of roadService.roads ) {

			expect( road.spline.controlPoints.length ).toBeGreaterThanOrEqual( 2 );
			expect( road.geometries.length ).toBeGreaterThanOrEqual( 1 );

			for ( let geometry of road.geometries ) {

				expect( geometry.s ).not.toBeNaN();
				expect( geometry.x ).not.toBeNaN();
				expect( geometry.y ).not.toBeNaN();
				expect( geometry.hdg ).not.toBeNaN();
				expect( geometry.length ).not.toBeNaN();

				if ( geometry instanceof TvArcGeometry ) {
					expect( geometry.radius ).not.toBeNaN();
					expect( geometry.curvature ).not.toBeNaN();
				}

			}

		}

	} )

} );
