import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { SplineManager } from "app/managers/spline-manager";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { RoadService } from "app/services/road/road.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector2, Vector3 } from "three";

describe( 'SplineToGeometry test', () => {

	let splineFactory: SplineFactory;
	let roadService: RoadService;
	let eventServiceProvider: EventServiceProvider;
	let splineManager: SplineManager;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		splineManager = TestBed.inject( SplineManager );
		splineFactory = TestBed.inject( SplineFactory );
		roadService = TestBed.inject( RoadService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		testHelper = TestBed.inject( SplineTestHelper );

		eventServiceProvider.init();

	} );

	it( 'should create line geometry from a spline with 2 points', () => {

		const spline = SplineFactory.createSpline();

		spline.addControlPoint( new Vector3( 0, 0, 0 ) );
		spline.addControlPoint( new Vector3( 100, 0, 0 ) );

		splineManager.addSpline( spline );

		const geometry = spline.getGeometries()[ 0 ];

		expect( geometry.s ).toBe( 0 );
		expect( geometry.x ).toBe( 0 );
		expect( geometry.y ).toBe( 0 );
		expect( geometry.hdg ).toBe( 0 );
		expect( geometry.length ).toBe( 100 );

	} )

	it( 'should create line geometry from a spline with 3 points', () => {

		const spline = SplineFactory.createSpline();

		spline.addControlPoint( new Vector3( 0, 0, 0 ) );
		spline.addControlPoint( new Vector3( 100, 0, 0 ) );
		spline.addControlPoint( new Vector3( 200, 0, 0 ) );

		splineManager.addSpline( spline );

		const exportGeometries = spline.getGeometries();

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

		const exportGeometries = spline.getGeometries();

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

		const vertical = testHelper.createDefaultRoad( [ new Vector2( 0, -100 ), new Vector2( 50, 100 ) ] );

		const horizontal = testHelper.createDefaultRoad( [ new Vector2( -100, 0 ), new Vector2( 100, 0 ) ] );

		splineManager.addSpline( vertical.spline );

		// expect( roadService.roads.length ).toBe( 16 );

		for ( let road of roadService.roads ) {

			expect( road.spline.getControlPointCount() ).toBeGreaterThanOrEqual( 2 );
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
