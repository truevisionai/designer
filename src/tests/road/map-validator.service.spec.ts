import { TestBed, inject } from '@angular/core/testing';
import { MapValidatorService } from '../../app/services/map/map-validator.service';
import { BaseTest } from '../base-test.spec';
import { RoadService } from 'app/services/road/road.service';
import { Vector2 } from 'three';
import { TvContactPoint } from 'app/map/models/tv-common';
import { HttpClientModule } from '@angular/common/http';
import { MapService } from 'app/services/map/map.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { OpenDriveParserService } from "../../app/importers/open-drive/open-drive-parser.service";
import { XML } from '../stubs/crossing-8-road-stub';

xdescribe( 'Service: MapValidator', () => {

	let base = new BaseTest();
	let roadService: RoadService;
	let mapValidator: MapValidatorService;
	let mapService: MapService;
	let eventServiceProvider: EventServiceProvider;
	let openDriveParser: OpenDriveParserService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ MapValidatorService ]
		} );

		roadService = TestBed.inject( RoadService );
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

		const roadA = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 100, 0 )
		] );

		const roadB = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 500, 0 )
		] );

		roadA.setSuccessorRoad( roadB, TvContactPoint.START );
		roadB.setPredecessorRoad( roadA, TvContactPoint.END );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( false );

	} );

	it( 'should fail for horizontal connections without lane links', () => {

		const roadA = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 100, 0 )
		] );

		const roadB = base.createDefaultRoad( roadService, [
			new Vector2( 200, 0 ),
			new Vector2( 100, 0 )
		] );

		roadA.setSuccessorRoad( roadB, TvContactPoint.END );
		roadB.setSuccessorRoad( roadA, TvContactPoint.END );

		expect( mapValidator.validateMap( mapService.map ) ).toBe( false );

	} );

	it( 'should fail for vertical connections without lane links', () => {

		const roadA = base.createDefaultRoad( roadService, [
			new Vector2( 0, 0 ),
			new Vector2( 0, 100 )
		] );

		const roadB = base.createDefaultRoad( roadService, [
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


