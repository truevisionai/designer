/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { Asset, AssetType } from "app/assets/asset.model";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { BaseTool } from "../../tools/base-tool";
import { ToolType } from "../../tools/tool-types.enum";
import { ToolFactory } from "../../tools/tool.factory";
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { Surface } from "app/map/surface/surface.model";
import { SurfaceToolTextureAssetHandler } from "./services/surface-tool-texture-asset-handler";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "three";
import { Commands } from "app/commands/commands";
import { AssetService } from "app/assets/asset.service";
import { TextureAsset, TvTexture } from "app/assets/texture/tv-texture.model";
import { SurfacePointCreationStrategy } from "./services/surface-creation-strategy";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { SelectionService } from "../../tools/selection.service";
import { setupTest } from "tests/setup-tests";

describe( 'SurfaceTool', () => {

	let tool: BaseTool<any>;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );

		tool = TestBed.inject( ToolFactory ).createTool( ToolType.Surface ) as BaseTool<any>;

		tool.init();

	} );

	it( 'should setup tool', () => {

		expect( tool ).toBeDefined();

	} );

	it( 'should set hint', () => {

		spyOn( tool, 'setHint' );

		tool.init();

		expect( tool.setHint ).toHaveBeenCalled();

	} );

	it( 'should have visualizers', () => {

		expect( tool.hasVisualizerForKey( SimpleControlPoint ) ).toBeTrue();
		expect( tool.hasVisualizerForKey( Surface ) ).toBeTrue();

	} );

	it( 'should have controllers', () => {

		expect( tool.hasControllerForKey( SimpleControlPoint ) ).toBeTrue();
		expect( tool.hasControllerForKey( Surface ) ).toBeTrue();

	} );

	it( 'should have selectors', () => {

		expect( tool.hasSelectorForKey( SimpleControlPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( Surface ) ).toBeTrue();

	} );

	it( 'should have drag handlers', () => {

		expect( tool.getDragHandlerByKey( SimpleControlPoint ) ).toBeDefined();

	} );

	it( 'should be able to handle texture asset', () => {

		const textureAsset = new Asset( AssetType.TEXTURE, '', '' );

		expect( tool.isAssetSupported( textureAsset ) ).toBeTrue();

	} );

	// it( 'should be able to handle material asset', () => {

	// 	const materialAsset = new Asset( AssetType.MATERIAL, '', '' );

	// 	expect( tool.isAssetSupported( materialAsset ) ).toBeTrue();

	// } );


} );



describe( 'SurfaceTool: TextureAssetHandler', () => {

	let assetHandler: SurfaceToolTextureAssetHandler;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		TestBed.inject( EventServiceProvider ).init();

		assetHandler = TestBed.inject( SurfaceToolTextureAssetHandler );

	} );


	it( 'should be able to handle texture asset', () => {

		const textureAsset = new Asset( AssetType.TEXTURE, '', '' );

		expect( assetHandler.isAssetSupported( textureAsset ) ).toBeTrue();

	} );

	it( 'should add and select', () => {

		const asset = new Asset( AssetType.TEXTURE, 'guid', '' );
		const texture = new TvTexture( '' );
		const textureAsset = new TextureAsset( 'guid', texture );

		spyOn( Commands, 'AddSelect' );
		spyOn( texture, 'image' ).and.returnValue( { width: 100, height: 100 } );
		spyOn( TestBed.inject( AssetService ), 'getTexture' ).and.returnValue( textureAsset );

		const event = PointerEventData.create( new Vector3( 0, 0, 0 ) );

		assetHandler.onAssetDropped( asset, event );

		expect( Commands.AddSelect ).toHaveBeenCalled();

	} );

} );

describe( 'SurfaceTool: PointCreationStrategy', () => {

	let creationStrategy: SurfacePointCreationStrategy;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		TestBed.inject( EventServiceProvider ).init();

		creationStrategy = TestBed.inject( SurfacePointCreationStrategy );

	} );


	it( 'should pass validation', () => {

		const event = PointerEventData.create( new Vector3( 0, 0, 0 ) );

		const validation = creationStrategy.validate( event );

		expect( validation.passed ).toBeTrue();

	} );

	it( 'should create surface', () => {

		const event = PointerEventData.create( new Vector3( 0, 0, 0 ) );

		const surface = creationStrategy.createObject( event );

		expect( surface ).toBeDefined();

		expect( surface ).toBeInstanceOf( AbstractControlPoint );

	} );

	it( 'should create point when surface is selected', () => {

		const event = PointerEventData.create( new Vector3( 0, 0, 0 ) );

		const surface = creationStrategy.createObject( event );

		spyOn( SelectionService.prototype, 'findSelectedObject' ).and.returnValue( surface );

		const event2 = PointerEventData.create( new Vector3( 0, 0, 0 ) );

		const point = creationStrategy.createObject( event2 );

		expect( point ).toBeDefined();

		expect( point ).toBeInstanceOf( AbstractControlPoint );

	} );

} );
