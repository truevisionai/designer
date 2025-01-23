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
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { RoadControlPoint } from 'app/objects/road/road-control-point';
import { BackTangentPoint, FrontTangentPoint } from 'app/objects/road/road-tangent-point';
import { RoadNode } from 'app/objects/road/road-node';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'app/core/maths';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { ToolBarService } from "../../views/editor/tool-bar/tool-bar.service";
import { ToolManager } from "../../managers/tool-manager";
import { RoadTool } from "./road-tool";
import { AppInspector } from 'app/core/inspector';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { CommandHistory } from 'app/commands/command-history';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { setupTest } from 'tests/setup-tests';

describe( 'RoadTool', () => {

	let tool: BaseTool<any>;

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

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

		expect( tool.hasHandlerForKey( AutoSpline ) ).toBeTrue();
		expect( tool.hasHandlerForKey( ExplicitSpline ) ).toBeTrue();
		expect( tool.hasHandlerForKey( SplineControlPoint ) ).toBeTrue();
		expect( tool.hasHandlerForKey( RoadControlPoint ) ).toBeTrue();
		expect( tool.hasHandlerForKey( FrontTangentPoint ) ).toBeTrue();
		expect( tool.hasHandlerForKey( BackTangentPoint ) ).toBeTrue();

		// TODO: add support for this
		// expect( tool.hasHandlersFor( RoadNode ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		tool.init();

		expect( tool.hasSelectorForKey( SplineControlPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( RoadControlPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( FrontTangentPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( BackTangentPoint ) ).toBeTrue();
		expect( tool.hasSelectorForKey( RoadNode ) ).toBeTrue();
		expect( tool.hasSelectorForKey( AutoSpline ) ).toBeTrue();
		expect( tool.hasSelectorForKey( ExplicitSpline ) ).toBeTrue();

	} );

} );

describe( 'RoadTool: Spline Editing', () => {

	let tool: BaseTool<any>;
	let testHelper: SplineTestHelper;
	let road: TvRoad;
	let spline: AbstractSpline;

	const runTest = ( splineType: SplineType ) => {

		beforeEach( () => {

			setupTest();

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

			expect( newPoint.position.x ).toEqual( 200 );
			expect( newPoint.position.y ).toEqual( 200 );
			expect( newPoint.position.z ).toEqual( 0 );

			expect( newPoint ).toBeInstanceOf( splineType === SplineType.EXPLICIT ? RoadControlPoint : SplineControlPoint );

			expect( spline.getControlPointCount() ).toBe( 3 );

			expect( AppInspector.getCurrentInspector().name ).toBe( RoadInspector.name );

			expect( AppInspector.getInspectorData() ).toEqual( {
				spline: spline,
				controlPoint: spline.getControlPoints()[ 2 ],
			} );

		} );

		it( 'should undo deleted contol point', () => {

			const thirdPoint = ControlPointFactory.createControlPoint( spline, new Vector3( 100, 100, 0 ) );
			tool.onObjectAdded( thirdPoint );

			const fourthPoint = ControlPointFactory.createControlPoint( spline, new Vector3( 120, 120, 0 ) );
			tool.onObjectAdded( fourthPoint );

			expect( spline.getControlPointCount() ).toBe( 4 );

			tool.onObjectSelected( thirdPoint );

			tool.onDeleteKeyDown();

			expect( spline.getControlPointCount() ).toBe( 3 );

			CommandHistory.undo();

			expect( spline.getControlPointCount() ).toBe( 4 );

			// TODO: fix this
			// expect( spline.getControlPoints()[ 2 ] ).toBe( thirdPoint );
			// expect( spline.getControlPoints()[ 3 ] ).toBe( fourthPoint );

			expect( spline.getControlPoints()[ 2 ].index ).toBe( 2 );
			expect( spline.getControlPoints()[ 3 ].index ).toBe( 3 );


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

			// expect( AppInspector.getInspectorData() ).toEqual( {
			// 	spline: testHelper.mapService.getSplines()[ 1 ],
			// 	controlPoint: testHelper.mapService.getSplines()[ 1 ].getControlPoints()[ 0 ],
			// } );

		} );

		it( 'new created spline should be selected', () => {

			const event = new PointerEventData( {
				point: new Vector3( 100, 100, 0 ),
			} );

			tool.onPointerDownCreate( event );

			const spline = testHelper.mapService.getSplines()[ 1 ];

			expect( tool.getSelectedObjectCount() ).toBe( 1 );

			expect( tool.getSelectedObjects()[ 0 ] ).toBe( spline );

			// expect( tool.getSelectedObjects()[ 1 ] ).toBe( spline.getControlPoints()[ 0 ] );

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

	describe( 'AutoSpline', () => runTest( SplineType.AUTOV2 ) );
	describe( 'ExplicitSpline', () => runTest( SplineType.EXPLICIT ) );

} );
