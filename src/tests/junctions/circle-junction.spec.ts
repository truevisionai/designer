import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MapService } from 'app/services/map/map.service';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { RoadValidator } from 'app/managers/road/road-validator';
import { RoadLinkValidator } from 'app/managers/road/road-link-validator';
import { Vector3 } from 'three';

describe( 'CircleJunctionTest', () => {

	let mapService: MapService;
	let testHelper: SplineTestHelper;
	let roadValidtor: RoadValidator;
	let roadLinkValidator: RoadLinkValidator;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		TestBed.get( EventServiceProvider ).init();

		mapService = TestBed.get( MapService );
		testHelper = TestBed.get( SplineTestHelper );
		roadValidtor = TestBed.get( RoadValidator );
		roadLinkValidator = TestBed.get( RoadLinkValidator );

	} );

	it( 'should create simple connections through a circular road', () => {

		testHelper.addCircleRoad( 50 );
		testHelper.addStraightRoad( new Vector3( -50, -50 ), 150, 45 );

		expect( mapService.map.getJunctionCount() ).toBe( 2 );

		mapService.map.getRoads().forEach( road => {
			expect( roadValidtor.validateRoad( road ) ).toBe( true, 'Road validation failed for road ' + road.id );
		} );

	} )

} );
