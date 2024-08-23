import { HttpClientModule } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { Log } from "app/core/utils/log";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { JunctionManager } from "app/managers/junction-manager";
import { SplineManager } from "app/managers/spline-manager";
import { disableMeshBuilding, enableMeshBuilding } from "app/map/builders/od-builder-config";
import { MapService } from "app/services/map/map.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { Vector3 } from "three";
import { expectValidMap } from "../base-test.spec";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionUtils } from "app/utils/junction.utils";

describe( 'Circle-Road-Junction Tests', () => {

	let splineTestHelper: SplineTestHelper;
	let eventServiceProvider: EventServiceProvider;
	let mapService: MapService;
	let junctionManager: JunctionManager;
	let splineManager: SplineManager;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		splineTestHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		mapService = TestBed.inject( MapService );
		junctionManager = TestBed.inject( JunctionManager );
		splineManager = TestBed.inject( SplineManager );

		eventServiceProvider.init();

	} );

	it( 'should handle 4-road-circle & horizontal spline', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.addCircleRoad( 50 );
		splineTestHelper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		expect( mapService.junctions.length ).toBe( 2 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 12 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 2 ) ).length ).toBe( 12 );

		expectValidMap( mapService );

	} ) );

	it( 'should handle 4-road-circle & horizontal spline movement', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.addCircleRoad( 50 );

		const horizontal = splineTestHelper.addStraightRoadSpline( new Vector3( -50, 0, 0 ) );

		// move the horizontal spline to right by 50
		horizontal.controlPoints.forEach( point => point.position.x += 50 );

		splineManager.updateSpline( horizontal );

		expect( mapService.junctions.length ).toBe( 2 );

		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 20 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 2 ) ).length ).toBe( 6 );

		expectValidMap( mapService );

	} ) );

	it( 'should handle 4-road-circle & default junction', fakeAsync( () => {

		AbstractSpline.reset();

		Log.debug( 'should handle 4-road-circle & default junction' );

		splineTestHelper.addCircleRoad( 50 );

		expect( mapService.junctions.length ).toBe( 0 );

		splineTestHelper.addDefaultJunction();

		tick( 0 );

		expectValidMap( mapService );

		expect( mapService.junctions.length ).toBe( 2 );

		tick( 100 );

		expect( mapService.junctions.length ).toBe( 5 );

		mapService.junctions.forEach( junction => {
			if ( junction.id == 5 ) {
				expect( junction.getConnectionCount() ).toBe( 20 );
			} else {
				expect( junction.getConnectionCount() ).toBe( 12 );
			}
		} );

		expectValidMap( mapService );

	} ) );

	it( 'should handle 1-road-circle & horizontal spline', fakeAsync( () => {

		AbstractSpline.reset();

		splineTestHelper.addCircleSplineV2( 50 );

		const horizontal = splineTestHelper.createStraightSpline( new Vector3( -50, 0, 0 ) );

		splineManager.addSpline( horizontal, false );

		junctionManager.detectJunctions( horizontal );

		expect( mapService.junctions.length ).toBe( 1 );
		expect( JunctionUtils.getLaneLinks( mapService.findJunction( 1 ) ).length ).toBe( 12 );
		expectValidMap( mapService );

	} ) );

} );
