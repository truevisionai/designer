import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { SplineManager } from 'app/managers/spline-manager';
import { MapService } from 'app/services/map/map.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { BaseTest } from 'tests/base-test.spec';

describe( 'RoadTool: UpdateConnectedRoads', () => {

	let base: BaseTest = new BaseTest;
	let roadToolService: RoadToolService
	let mapService: MapService;
	let splineManager: SplineManager;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService, MatSnackBar ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		roadToolService = TestBed.get( RoadToolService );
		mapService = TestBed.get( MapService );
		splineManager = TestBed.get( SplineManager );
		eventServiceProvider = TestBed.get( EventServiceProvider );

		eventServiceProvider.init();

	} );

	it( 'should have correct links', () => {

		base.createConnectedRoads( roadToolService );

		const left = mapService.getRoad( 1 );
		const right = mapService.getRoad( 2 );
		const joining = mapService.getRoad( 3 );

		expect( left.predecessor ).toBeUndefined();
		expect( left.successor.element ).toBe( joining );
		expect( left.spline.controlPoints.length ).toBe( 2 );

		expect( joining.predecessor.element ).toBe( left );
		expect( joining.successor.element ).toBe( right );
		expect( joining.spline.controlPoints.length ).toBe( 4 );

		expect( right.predecessor.element ).toBe( joining );
		expect( right.successor ).toBeUndefined();
		expect( right.spline.controlPoints.length ).toBe( 2 );

	} );

	it( 'should update successor and predecessor', () => {

		base.createConnectedRoads( roadToolService );

		const left = mapService.getRoad( 1 );
		const right = mapService.getRoad( 2 );
		const joining = mapService.getRoad( 3 );

		joining.spline.controlPoints.forEach( point => point.position.y = 1 );

		splineManager.updateSpline( joining.spline );

		right.spline.controlPoints.forEach( point => expect( point.position.y ).toBe( 1 ) );
		left.spline.controlPoints.forEach( point => expect( point.position.y ).toBe( 1 ) );

	} );

} );
