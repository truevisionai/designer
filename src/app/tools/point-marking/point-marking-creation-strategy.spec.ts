/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { PointMarkingCreationStrategy } from './point-marking-creation-strategy';
import { AssetManager } from 'app/assets/asset.manager';
import { AssetType } from 'app/assets/asset.model';
import { Vector3 } from 'app/core/maths';
import { MockAssetFactory } from 'app/factories/asset-factory.service';
import { CreationStrategy } from 'app/core/interfaces/creation-strategy';
import { PointMarkingControlPoint } from './objects/point-marking-object';
import { PointerEventData } from 'app/events/pointer-event-data';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { setupTest } from "../../../tests/setup-tests";
import { SelectionService } from "../selection.service";
import { SplineTestHelper } from "../../services/spline/spline-test-helper.service";
import { RoadObjectService } from "../../map/road-object/road-object.service";
import { TvTextureService } from "../../assets/texture/tv-texture.service";
import { TvRoad } from "../../map/models/tv-road.model";


describe( 'PointMarkingCreationStrategy', () => {

	let strategy: CreationStrategy<PointMarkingControlPoint>;
	let selectionService: SelectionService;
	let assetManager: AssetManager;
	let textureService: TvTextureService;
	let roadObjectService: RoadObjectService;
	let testHelper: SplineTestHelper;
	let road: TvRoad;

	beforeEach( () => {

		setupTest();

		TestBed.inject( SelectionService );

		strategy = TestBed.inject( PointMarkingCreationStrategy );
		selectionService = TestBed.inject( SelectionService );
		assetManager = TestBed.inject( AssetManager );
		textureService = TestBed.inject( TvTextureService );
		roadObjectService = TestBed.inject( RoadObjectService );
		testHelper = TestBed.inject( SplineTestHelper );

		road = testHelper.addStraightRoad();

		assetManager.setTextureAsset( MockAssetFactory.createAsset( AssetType.TEXTURE ) );

	} );

	it( 'should be created', () => {

		expect( strategy ).toBeTruthy();

	} );

	it( 'should be invalid for non-road area', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		const result = strategy.validate( event );

		expect( result.passed ).toBeFalse();

	} );


	it( 'should be valid for road area', () => {

		const event = PointerEventData.create( new Vector3( 1, 2, 3 ) );

		const result = strategy.validate( event );

		expect( result.passed ).toBeFalse();

	} );


	it( 'should import asset and create point marking', () => {

		const textureAsset = MockAssetFactory.createAsset( AssetType.TEXTURE );

		assetManager.setTextureAsset( textureAsset );

		const validation = strategy.validate( new PointerEventData() );

		expect( validation.passed ).toBeFalse();

		const event = PointerEventData.create( new Vector3( 1, 2, 3 ) );

		const object = strategy.createObject( event );

		expect( object ).toBeInstanceOf( AbstractControlPoint );

	} );


} );
