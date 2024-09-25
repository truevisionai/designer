/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { ToolFactory } from "../tool.factory";
import { PointMarkingControlPoint } from "./objects/point-marking-object";
import { TvRoad } from "app/map/models/tv-road.model";
import { Asset, AssetType } from "app/assets/asset.model";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "three";
import { AssetManager } from "app/assets/asset.manager";
import { PointMarkingCreationStrategy } from "./point-marking-creation-strategy";
import { ValidationPassed } from "app/core/interfaces/creation-strategy";
import { TvMapQueries } from "app/map/queries/tv-map-queries";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { AppInspector } from "app/core/inspector";
import { setupTest } from "tests/setup-tests";

describe( 'PointMarkingTool', () => {

	let tool: BaseTool<any>;
	let testHelper: SplineTestHelper;
	let road: TvRoad;

	beforeEach( () => {

		setupTest();

		TestBed.inject( EventServiceProvider ).init();

		testHelper = TestBed.inject( SplineTestHelper );

		tool = TestBed.inject( ToolFactory ).createTool( ToolType.PointMarkingTool ) as BaseTool<any>;

		tool.init();

		road = testHelper.addStraightRoad();

		TestBed.inject( AssetManager ).setTextureAsset( new Asset( AssetType.TEXTURE, '', '' ) );

		tool.onObjectSelected( road );

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

		expect( tool.hasVisualizerForKey( PointMarkingControlPoint ) ).toBeTrue();
		expect( tool.hasVisualizerForKey( TvRoad ) ).toBeTrue();

	} );

	it( 'should have controllers', () => {

		expect( tool.hasControllerForKey( PointMarkingControlPoint ) ).toBeTrue();
		expect( tool.hasControllerForKey( TvRoad ) ).toBeTrue();

	} );

	it( 'should have selectors', () => {

		expect( tool.hasSelectorForKey( PointMarkingControlPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( TvRoad ) ).toBeTrue();

	} );

	it( 'should have drag handlers', () => {

		expect( tool.getDragHandlerByKey( PointMarkingControlPoint ) ).toBeDefined();

	} );

	it( 'should be able to handle texture asset', () => {

		const textureAsset = new Asset( AssetType.TEXTURE, '', '' );

		expect( tool.isAssetSupported( textureAsset ) ).toBeTrue();

	} );

	it( 'should be able to handle material asset', () => {

		const materialAsset = new Asset( AssetType.MATERIAL, '', '' );

		expect( tool.isAssetSupported( materialAsset ) ).toBeTrue();

	} );

	it( 'should show inspector when selected', () => {

		spyOn( PointMarkingCreationStrategy.prototype, 'validate' ).and.returnValue( new ValidationPassed() );

		spyOn( TvMapQueries, 'findRoadCoord' ).and.returnValue( new TvRoadCoord( road, 0, 0 ) );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3() ) );

		expect( AppInspector.getCurrentInspector() ).toBeDefined();

	} );


} );
