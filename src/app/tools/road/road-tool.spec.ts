/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseTool } from '../base-tool';
import { ToolFactory } from '../tool.factory';
import { ToolType } from '../tool-types.enum';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { RoadTangentPoint } from 'app/objects/road-tangent-point';
import { RoadNode } from 'app/objects/road-node';
import { SimpleControlPoint } from 'app/objects/simple-control-point';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { ToolBarService } from "../../views/editor/tool-bar/tool-bar.service";
import { ToolManager } from "../../managers/tool-manager";
import { RoadTool } from "./road-tool";
import { AppInspector } from 'app/core/inspector';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { CommandHistory } from 'app/commands/command-history';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';

describe( 'RoadTool', () => {

	let tool: BaseTool<any>;

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		testHelper = TestBed.inject( SplineTestHelper );

		tool = TestBed.inject( ToolFactory ).createTool( ToolType.Road ) as BaseTool<any>;

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

		expect( tool.hasHandlersFor( AutoSpline.name ) ).toBeTrue();
		expect( tool.hasHandlersFor( ExplicitSpline.name ) ).toBeTrue();
		expect( tool.hasHandlersFor( SplineControlPoint.name ) ).toBeTrue();
		expect( tool.hasHandlersFor( RoadControlPoint.name ) ).toBeTrue();
		expect( tool.hasHandlersFor( RoadTangentPoint.name ) ).toBeTrue();

		// TODO: add support for this
		// expect( tool.hasHandlersFor( RoadNode.name ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		tool.init();

		expect( tool.hasSelectionStrategy( SimpleControlPoint.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( RoadNode.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( AutoSpline.name ) ).toBeTrue();

	} );

} );

describe( 'RoadTool: Spline Editing', () => {

	let tool: BaseTool<any>;
	let testHelper: SplineTestHelper;
	let road: TvRoad;
	let spline: AbstractSpline;

	const setupTest = ( splineType: SplineType ) => {

		beforeEach( () => {

			TestBed.configureTestingModule( {
				imports: [ HttpClientModule, MatSnackBarModule ],
			} );

			ToolManager.clear();

			testHelper = TestBed.inject( SplineTestHelper );

			road = testHelper.addStraightRoad( new Vector3(), 100, 0, splineType );

			spline = road.spline;

			TestBed.inject( ToolBarService ).setToolByType( ToolType.Road );

			tool = ToolManager.getTool();

			TestBed.inject( EventServiceProvider ).init();

		} );

		it( 'should set tool', () => {

			expect( ToolManager.getTool() ).toBeInstanceOf( RoadTool );

		} );

		it( 'should select spline', () => {

			spyOn( tool, 'setObjectHint' );

			tool.onObjectSelected( spline );

			expect( tool.setObjectHint ).toHaveBeenCalled();
			expect( AppInspector.getCurrentInspector().name ).toBe( RoadInspector.name );
			expect( AppInspector.getInspectorData() ).toEqual( {
				spline: spline,
			} );

		} );

		it( 'should unselect spline', () => {

			tool.onObjectSelected( spline );

			spyOn( AppInspector.inspectorCleared, 'emit' );

			const event = new PointerEventData( {
				button: MouseButton.LEFT,
				point: new Vector3( 1000, 100, 0 ),
			} );

			tool.onPointerDown( event );

			expect( AppInspector.inspectorCleared.emit ).toHaveBeenCalled();
			expect( AppInspector.getCurrentInspector() ).toBeNull();
			expect( AppInspector.getInspectorData() ).toBeNull();

		} );

		it( 'should add control point when spline is selected', () => {

			tool.onObjectSelected( spline );

			const event = new PointerEventData( {
				point: new Vector3( 200, 200, 0 ),
			} );

			tool.onPointerDownCreate( event );

			const newPoint = spline.getControlPoints()[ 2 ];

			expect( newPoint ).toBeDefined();

			expect( newPoint.position ).toEqual( new Vector3( 200, 200, 0 ) );

			expect( newPoint ).toBeInstanceOf( splineType === SplineType.EXPLICIT ? RoadControlPoint : SplineControlPoint );

			expect( spline.getControlPointCount() ).toBe( 3 );

			expect( AppInspector.getCurrentInspector().name ).toBe( RoadInspector.name );

			expect( AppInspector.getInspectorData() ).toEqual( {
				spline: spline,
				controlPoint: spline.getControlPoints()[ 2 ],
			} );

		} );

		it( 'should undo deleted contol point', () => {

			const thirdPoint = ControlPointFactory.createControl( spline, new Vector3( 100, 100, 0 ) );
			tool.onObjectAdded( thirdPoint );

			const fourthPoint = ControlPointFactory.createControl( spline, new Vector3( 120, 120, 0 ) );
			tool.onObjectAdded( fourthPoint );

			expect( spline.getControlPointCount() ).toBe( 4 );

			tool.onObjectSelected( thirdPoint );

			tool.onDeleteKeyDown();

			expect( spline.getControlPointCount() ).toBe( 3 );

			CommandHistory.undo();

			expect( spline.getControlPointCount() ).toBe( 4 );

			expect( spline.getControlPoints()[ 2 ] ).toBe( thirdPoint );
			expect( spline.getControlPoints()[ 2 ].tagindex ).toBe( 2 );

			expect( spline.getControlPoints()[ 3 ] ).toBe( fourthPoint );
			expect( spline.getControlPoints()[ 3 ].tagindex ).toBe( 3 );

		} );

		it( 'should unselect control point', () => {

			tool.onObjectSelected( spline.getControlPoints()[ 0 ] );

			const event = new PointerEventData( {
				button: MouseButton.LEFT,
				point: new Vector3( 1000, 100, 0 ),
			} );

			tool.onPointerDown( event );

			expect( AppInspector.getCurrentInspector() ).toBeNull();
			expect( AppInspector.getInspectorData() ).toBeNull();

		} );

		it( 'should create spline', () => {

			const event = new PointerEventData( {
				point: new Vector3( 100, 100, 0 ),
			} );

			tool.onPointerDownCreate( event );

			expect( testHelper.mapService.getRoadCount() ).toBe( 2 );
			expect( testHelper.mapService.getSplineCount() ).toBe( 2 );

			expect( AppInspector.getCurrentInspector().name ).toBe( RoadInspector.name );

			expect( AppInspector.getInspectorData() ).toEqual( {
				spline: testHelper.mapService.getSplines()[ 1 ],
				controlPoint: testHelper.mapService.getSplines()[ 1 ].getControlPoints()[ 0 ],
			} );

		} );

		it( 'new created spline should be selected', () => {

			const event = new PointerEventData( {
				point: new Vector3( 100, 100, 0 ),
			} );

			tool.onPointerDownCreate( event );

			const spline = testHelper.mapService.getSplines()[ 1 ];

			expect( tool.getSelectedObjectCount() ).toBe( 2 );

			expect( tool.getSelectedObjects()[ 0 ] ).toBe( spline );

			expect( tool.getSelectedObjects()[ 1 ] ).toBe( spline.getControlPoints()[ 0 ] );

		} );

		it( 'should undo deleted spline', () => {

			tool.onObjectSelected( spline );

			tool.onDeleteKeyDown();

			expect( testHelper.mapService.getRoadCount() ).toBe( 0 );
			expect( testHelper.mapService.getSplineCount() ).toBe( 0 );

			CommandHistory.undo();

			expect( testHelper.mapService.getRoadCount() ).toBe( 1 );
			expect( testHelper.mapService.getSplineCount() ).toBe( 1 );

		} );

	};

	describe( 'AutoSpline', () => setupTest( SplineType.AUTOV2 ) );
	describe( 'ExplicitSpline', () => setupTest( SplineType.EXPLICIT ) );

} );
