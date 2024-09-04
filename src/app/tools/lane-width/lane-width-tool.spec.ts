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
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvLane } from "app/map/models/tv-lane";
import { LaneWidthLine } from "app/tools/lane-width/objects/lane-width-line";
import { LaneWidthPoint } from "app/tools/lane-width/objects/lane-width-point";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "three";

describe( 'LaneWidthTool: Handlers', () => {

	let tool: BaseTool<any>;

	let testHelper: SplineTestHelper;

	let road: TvRoad;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		TestBed.inject( EventServiceProvider ).init();

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

		expect( tool.hasHandlersForName( LaneWidthLine.name ) ).toBeTrue();
		expect( tool.hasHandlersForName( LaneWidthPoint.name ) ).toBeTrue();
		expect( tool.hasHandlersForName( TvLane.name ) ).toBeTrue();
		expect( tool.hasHandlersForName( TvRoad.name ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		expect( tool.hasSelectionStrategy( LaneWidthLine.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( LaneWidthPoint.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( TvLane.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( TvRoad.name ) ).toBeTrue();

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

		const lane = road.getLaneProfile().getFirstLaneSection().getLaneById( -2 )

		const selectionService = tool.getSelectionService();

		spyOn( selectionService, 'executeSelection' ).and.returnValue( lane );

		tool.onObjectSelected( road );
		tool.onObjectSelected( lane );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 2, 2, 0 ) ) )

		expect( lane.getLaneWidthCount() ).toBe( 2 );
		expect( tool.getSelectedObjectCount() ).toBe( 3 );
		expect( selectionService.getSelectedObjects()[ 0 ] ).toBeInstanceOf( TvRoad )
		expect( selectionService.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvLane )
		expect( selectionService.getSelectedObjects()[ 2 ] ).toBeInstanceOf( LaneWidthPoint )

	} );

	it( 'should create and select second width node', () => {

		const lane = road.getLaneProfile().getFirstLaneSection().getLaneById( -2 )

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
		expect( selectionService.getSelectedObjects()[ 2 ] ).toBeInstanceOf( LaneWidthPoint )

		const point = selectionService.findSelectedObject<LaneWidthPoint>( LaneWidthPoint.name );

		expect( point.width ).toEqual( lane.getLaneWidthVector()[ 2 ] )

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
		expect( selectionService.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvLane )

	} );

} );
