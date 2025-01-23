/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { ToolManager } from "app/managers/tool-manager";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { ToolBarService } from "app/views/editor/tool-bar/tool-bar.service";
import { BaseTool } from "../../../tools/base-tool";
import { ToolType } from "../../../tools/tool-types.enum";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvLane } from "app/map/models/tv-lane";
import { LaneWidthLine } from "app/modules/lane-width/objects/lane-width-line";
import { LaneWidthPoint } from "app/modules/lane-width/objects/lane-width-point";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "app/core/maths"
import { LaneWidthNode } from "../objects/lane-width-node";
import { setupLaneWidthTest, setupTest } from "tests/setup-tests";

describe( 'LaneWidthTool: Handlers', () => {

	let tool: BaseTool<any>;

	let testHelper: SplineTestHelper;

	let road: TvRoad;

	beforeEach( () => {

		setupLaneWidthTest();

		ToolManager.clear();

		TestBed.inject( ToolBarService ).setToolByType( ToolType.LaneWidth );

		tool = ToolManager.getTool();

		testHelper = TestBed.inject( SplineTestHelper );

		road = testHelper.addStraightRoad();

		tool.init();

	} );

	it( 'should setup tool', () => {

		expect( tool ).toBeDefined();

		expect( ToolManager.getToolType() ).toBe( ToolType.LaneWidth );

	} );

	it( 'should have object handlers', () => {

		expect( tool.hasHandlerForKey( LaneWidthLine ) ).toBeTrue();
		expect( tool.hasHandlerForKey( LaneWidthPoint ) ).toBeTrue();
		expect( tool.hasHandlerForKey( TvLane ) ).toBeTrue();
		expect( tool.hasHandlerForKey( TvRoad ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		expect( tool.hasSelectorForKey( LaneWidthLine ) ).toBeTrue();
		expect( tool.hasSelectorForKey( LaneWidthPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( TvLane ) ).toBeTrue();
		expect( tool.hasSelectorForKey( TvRoad ) ).toBeTrue();

	} );

	it( 'should select road', () => {

		const event = PointerEventData.create( new Vector3( 2, 2, 0 ) );

		tool.onPointerDownSelect( event );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );

		expect( tool.getSelectedObjects()[ 0 ] ).toBe( road );

	} );

	it( 'should select lane', () => {

		const event = PointerEventData.create( new Vector3( 2, 2, 0 ) );

		tool.onPointerDownSelect( event );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );

		tool.onObjectSelected( road.getLaneProfile().getFirstLaneSection().getLaneById( -1 ) );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );

		expect( tool.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad );
		expect( tool.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvLane );

	} );

	it( 'should create and select width node', () => {

		const lane = road.getLaneProfile().getFirstLaneSection().getLaneById( 1 )

		const selectionService = tool.getSelectionService();

		spyOn( selectionService, 'executeSelection' ).and.returnValue( lane );

		tool.onObjectSelected( road );
		tool.onObjectSelected( lane );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 2, 2, 0 ) ) )

		expect( lane.getLaneWidthCount() ).toBe( 2 );
		expect( tool.getSelectedObjectCount() ).toBe( 3 );
		expect( selectionService.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad )
		expect( selectionService.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvLane )
		expect( selectionService.getSelectedObjects()[ 2 ] ).toBeInstanceOf( LaneWidthNode )

	} );

	it( 'should create and select second width node', () => {

		const lane = road.getLaneProfile().getFirstLaneSection().getLaneById( 1 )

		const selectionService = tool.getSelectionService();

		spyOn( selectionService, 'executeSelection' ).and.returnValue( lane );

		tool.onObjectSelected( road );
		tool.onObjectSelected( lane );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 2, 2, 0 ) ) )
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 3, 3, 0 ) ) )

		expect( lane.getLaneWidthCount() ).toBe( 3 );
		expect( tool.getSelectedObjectCount() ).toBe( 3 );
		expect( selectionService.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad )
		expect( selectionService.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvLane )
		expect( selectionService.getSelectedObjects()[ 2 ] ).toBeInstanceOf( LaneWidthNode )

		const node = selectionService.findSelectedObject<LaneWidthNode>( LaneWidthNode );

		expect( node.laneWidth ).toEqual( lane.getWidthArray()[ 2 ] )

	} );

	it( 'should unselect node and select lane', () => {

		const lane = road.getLaneProfile().getFirstLaneSection().getLaneById( -2 )

		const selectionService = tool.getSelectionService();

		spyOn( selectionService, 'executeSelection' ).and.returnValue( lane );

		tool.onObjectSelected( road );
		tool.onObjectSelected( lane );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 2, 2, 0 ) ) )
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 3, 3, 0 ) ) )

		// click far away
		tool.onPointerDownSelect( PointerEventData.create( new Vector3( 100, 100, 0 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );
		expect( selectionService.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad )
		expect( selectionService.getSelectedObjects()[ 1 ] ).toBeInstanceOf( LaneWidthNode )

	} );

} );
