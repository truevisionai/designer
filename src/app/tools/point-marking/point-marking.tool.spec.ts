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
import { Vector2, Vector3 } from "app/core/maths"
import { AssetManager } from "app/assets/asset.manager";
import { PointMarkingCreationStrategy } from "./point-marking-creation-strategy";
import { ValidationPassed } from "app/core/interfaces/creation-strategy";
import { TvMapQueries } from "app/map/queries/tv-map-queries";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { AppInspector } from "app/core/inspector";
import { setupTest, setCurrentTool } from "tests/setup-tests";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import {
	expectInspectorRemoved, expectInspectorSet,
	expectViewModelExists,
} from "../../../tests/base-test.spec";

describe( 'PointMarkingTool', () => {

	let tool: BaseTool<any>;
	let testHelper: SplineTestHelper;
	let road: TvRoad;

	beforeEach( () => {

		setupTest();

		TestBed.inject( EventServiceProvider ).init();

		testHelper = TestBed.inject( SplineTestHelper );

		tool = setCurrentTool( ToolType.PointMarkingTool );

		road = testHelper.addStraightRoad();

		TestBed.inject( AssetManager ).setTextureAsset( new Asset( AssetType.TEXTURE, '', '' ) );

		tool.onObjectSelected( road );

		spyOn( PointMarkingCreationStrategy.prototype, 'getDimensions' ).and.returnValue( new Vector2( 1, 1 ) );

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

		// expect( tool.hasSelectorForKey( PointMarkingControlPoint ) ).toBeTrue(); // NOT NEEDED
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

	it( 'should select road', () => {

		const event = PointerEventData.create( new Vector3( 10, 0, 0 ) );

		tool.onPointerDownSelect( event );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );
		expect( tool.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad );

	} );

	it( 'should add and select point marking', () => {

		const event = PointerEventData.create( new Vector3( 10, 0, 0 ) );

		tool.onPointerDownSelect( event );
		tool.onPointerDownCreate( event );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );
		expect( tool.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad );
		expect( tool.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvRoadObject );

		expectViewModelExists( tool.getSelectedObjects()[ 1 ] );
		expectInspectorSet();

	} );

	it( 'should unselect added point marking', () => {

		const event = PointerEventData.create( new Vector3( 10, 0, 0 ) );

		tool.onPointerDownSelect( event );
		tool.onPointerDownCreate( event );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );
		expect( tool.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad );
		expect( tool.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvRoadObject );

		const roadObject = tool.getSelectedObjects()[ 1 ];

		tool.onPointerDownSelect( PointerEventData.create( new Vector3( 100, 100 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );
		expect( tool.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad );

		// expectViewModelHidden( roadObject );

		expectInspectorRemoved();

	} );

	it( 'should show inspector when selected', () => {

		spyOn( PointMarkingCreationStrategy.prototype, 'validate' ).and.returnValue( new ValidationPassed() );

		spyOn( TvMapQueries, 'findRoadCoord' ).and.returnValue( new TvRoadCoord( road, 0, 0 ) );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3() ) );

		expect( AppInspector.getCurrentInspector() ).toBeDefined();

	} );


} );
