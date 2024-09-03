/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseTool } from '../base-tool';
import { ToolType } from '../tool-types.enum';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvRoad } from 'app/map/models/tv-road.model';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { ToolManager } from 'app/managers/tool-manager';
import { ToolBarService } from 'app/views/editor/tool-bar/tool-bar.service';
import { Vector3 } from 'three';
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';
import { RoadGeometryService } from 'app/services/road/road-geometry.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { CommandHistory } from 'app/commands/command-history';
import { CornerControlPoint } from "./objects/corner-control-point";

describe( 'CrosswalkTool', () => {

	let tool: BaseTool<any>;

	let testHelper: SplineTestHelper;

	let road: TvRoad;

	let crosswalk: TvRoadObject;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		TestBed.inject( EventServiceProvider ).init();

		ToolManager.clear();

		testHelper = TestBed.inject( SplineTestHelper );

		road = testHelper.addStraightRoad( new Vector3(), 100, 0 );

		TestBed.inject( ToolBarService ).setToolByType( ToolType.Crosswalk );

		tool = ToolManager.getTool();

		const roadCoord = RoadGeometryService.instance.findRoadCoord( road, 0 );

		crosswalk = RoadObjectFactory.createRoadObject( TvRoadObjectType.crosswalk, roadCoord );

	} );


	it( 'should setup tool', () => {

		expect( tool ).toBeDefined();

	} );

	it( 'should set hint', () => {

		spyOn( tool, 'setHint' );

		tool.init();

		expect( tool.setHint ).toHaveBeenCalled();

	} );

	it( 'should have object handlers', () => {

		tool.init();

		expect( tool.hasHandlersForName( TvRoad.name ) ).toBeTrue();
		expect( tool.hasHandlersForName( CornerControlPoint.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( CrosswalkInspector.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( TvObjectMarking.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( TvRoad.name ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		tool.init();

		expect( tool.hasSelectionStrategy( CornerControlPoint.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( TvRoadObject.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( TvRoad.name ) ).toBeTrue();

	} );

	it( 'should select road', () => {

		tool.onObjectSelected( road );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );

		expect( tool.getSelectedObjects()[ 0 ] ).toBe( road );

	} );

	it( 'should unselect road', () => {

		tool.onObjectUnselected( road );

		expect( tool.getSelectedObjectCount() ).toBe( 0 );

	} );

	it( 'should create and select crosswalk', () => {

		const event = PointerEventData.create( new Vector3( 5, 5, 0 ) );

		tool.onObjectSelected( road );

		tool.onPointerDownCreate( event );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );

		expect( tool.getSelectedObjects()[ 0 ] ).toBe( road );

		expect( tool.getSelectedObjects()[ 1 ] ).toBeInstanceOf( TvRoadObject );

		expect( AppInspector.getCurrentInspector().name ).toBe( DynamicInspectorComponent.name );

	} );

	it( 'should unselect corner control point', () => {

		tool.onObjectSelected( road );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );
		tool.onPointerDownSelect( PointerEventData.create( new Vector3( 100, 100 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 1 );

	} );

	it( 'should undo create crosswalk', () => {

		tool.onObjectSelected( road );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );

		CommandHistory.undo();

		expect( tool.getSelectedObjectCount() ).toBe( 1 );

		expect( AppInspector.getCurrentInspector() ).toBeNull();

	} );

	it( 'should add corner point in crosswalk', () => {

		tool.onObjectSelected( road );
		tool.onObjectSelected( crosswalk );

		expect( crosswalk.getOutlineCount() ).toBe( 1 );
		expect( crosswalk.getOutlines()[ 0 ].getCornerRoadCount() ).toBe( 1 );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 3 );

		expect( crosswalk.getOutlineCount() ).toBe( 1 );
		expect( crosswalk.getOutlines()[ 0 ].getCornerRoadCount() ).toBe( 2 );

		expect( AppInspector.getCurrentInspector().name ).toBe( DynamicInspectorComponent.name );

	} );

	it( 'should not add corner point in crosswalk when clicked outside the road', () => {

		tool.onObjectSelected( road );
		tool.onObjectSelected( crosswalk );
		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 100, 100, 0 ) ) );

		expect( tool.getSelectedObjectCount() ).toBe( 2 );

		expect( crosswalk.getOutlineCount() ).toBe( 1 );
		expect( crosswalk.getOutlines()[ 0 ].getCornerRoadCount() ).toBe( 1 );

		expect( AppInspector.getCurrentInspectorName() ).toBe( DynamicInspectorComponent.name );

	} );

	it( 'should undo add corner point in crosswalk', () => {

		tool.onObjectSelected( road );
		tool.onObjectSelected( crosswalk );

		expect( crosswalk.getOutlineCount() ).toBe( 1 );
		expect( crosswalk.getOutlines()[ 0 ].getCornerRoadCount() ).toBe( 1 );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );

		CommandHistory.undo();

		expect( crosswalk.getOutlineCount() ).toBe( 1 );
		expect( crosswalk.getOutlines()[ 0 ].getCornerRoadCount() ).toBe( 1 );

		expect( AppInspector.getCurrentInspector() ).toBeNull();

	} );

	it( 'should remove corner point in crosswalk', () => {

		tool.onObjectSelected( road );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );

		tool.onDeleteKeyDown();

		expect( AppInspector.getCurrentInspector() ).toBeNull();

	} );

	it( 'should undo remove corner point in crosswalk', () => {

		tool.onObjectSelected( road );

		tool.onPointerDownCreate( PointerEventData.create( new Vector3( 5, 5, 0 ) ) );

		tool.onDeleteKeyDown();

		CommandHistory.undo();

		expect( AppInspector.getCurrentInspectorName() ).toBe( DynamicInspectorComponent.name );

	} );

} );
