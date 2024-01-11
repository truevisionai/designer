import { TestBed, inject } from '@angular/core/testing';
import { MapValidatorService } from '../app/services/map-validator.service';
import { BaseTest } from './base-test.spec';
import { RoadService } from 'app/services/road/road.service';
import { Vector2 } from 'three';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { HttpClientModule } from '@angular/common/http';
import { MapService } from 'app/services/map.service';

describe( 'Service: MapValidator', () => {

	let base = new BaseTest();
	let roadService: RoadService;
	let mapValidator: MapValidatorService;
	let mapService: MapService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ MapValidatorService ]
		} );

		roadService = TestBed.inject( RoadService );
		mapValidator = TestBed.inject( MapValidatorService );
		mapService = TestBed.inject( MapService );

	} );

	it( 'should ...', inject( [ MapValidatorService ], ( service: MapValidatorService ) => {

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


} );


