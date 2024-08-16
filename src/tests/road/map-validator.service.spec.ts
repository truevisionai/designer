import { TestBed, inject } from '@angular/core/testing';
import { MapValidatorService } from '../../app/services/map/map-validator.service';
import { Vector2 } from 'three';
import { TvContactPoint } from 'app/map/models/tv-common';
import { HttpClientModule } from '@angular/common/http';
import { MapService } from 'app/services/map/map.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { OpenDriveParserService } from "../../app/importers/open-drive/open-drive-parser.service";
import { XML } from '../stubs/crossing-8-road-stub';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';

xdescribe( 'Service: MapValidator', () => {

	let mapValidator: MapValidatorService;
	let mapService: MapService;
	let eventServiceProvider: EventServiceProvider;
	let openDriveParser: OpenDriveParserService;
	let splineTestHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ MapValidatorService ]
		} );

		mapValidator = TestBed.inject( MapValidatorService );
		mapService = TestBed.inject( MapService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();
		openDriveParser = TestBed.inject( OpenDriveParserService );

	} );

	it( 'should create service', inject( [ MapValidatorService ], ( service: MapValidatorService ) => {

		expect( service ).toBeTruthy();

	} ) );

	it( 'should fail for distant connections', () => {

		const roadA = splineTestHelper.createDefaultRoad( [
			new Vector2( 0, 0 ),
			new Vector2( 100, 0 )
		] );

		const roadB = splineTestHelper.createDefaultRoad( [
			new Vector2( 0, 0 ),
			new Vector2( 500, 0 )
		] );

		roadA.setSuccessorRoad( roadB, TvContactPoint.START );
		roadB.setPredecessorRoad( roadA, TvContactPoint.END );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( false );

	} );

	it( 'should fail for horizontal connections without lane links', () => {

		const roadA = splineTestHelper.createDefaultRoad( [
			new Vector2( 0, 0 ),
			new Vector2( 100, 0 )
		] );

		const roadB = splineTestHelper.createDefaultRoad( [
			new Vector2( 200, 0 ),
			new Vector2( 100, 0 )
		] );

		roadA.setSuccessorRoad( roadB, TvContactPoint.END );
		roadB.setSuccessorRoad( roadA, TvContactPoint.END );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( false );

	} );

	it( 'should fail for vertical connections without lane links', () => {

		const roadA = splineTestHelper.createDefaultRoad( [
			new Vector2( 0, 0 ),
			new Vector2( 0, 100 )
		] );

		const roadB = splineTestHelper.createDefaultRoad( [
			new Vector2( 0, 200 ),
			new Vector2( 0, 100 )
		] );

		roadA.setSuccessorRoad( roadB, TvContactPoint.END );
		roadB.setSuccessorRoad( roadA, TvContactPoint.END );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( false );

	} );

	it( 'should validate crossing8.xodr', () => {

		const map = openDriveParser.parse( XML );

		expect( mapValidator.validateMap( map ) ).toBe( true );

	} );

} );


