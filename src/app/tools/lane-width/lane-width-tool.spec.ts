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

	} );

	it( 'should setup tool', () => {

		expect( tool ).toBeDefined();

		expect( ToolManager.getToolType() ).toBe( ToolType.LaneWidth );

	} );

	it( 'should have object handlers', () => {

		tool.init();

		// expect( tool.hasHandlersFor( LaneWidthNode.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( LaneWidthNodeInspector.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( SimpleControlPoint.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( DebugLine.name ) ).toBeTrue();
		// expect( tool.hasHandlersFor( TvLane.name ) ).toBeTrue();
		expect( tool.hasHandlersForName( TvRoad.name ) ).toBeTrue();

	} );

	it( 'should have selection strategies', () => {

		tool.init();

		// expect( tool.hasSelectionStrategy( DebugLine.name ) ).toBeTrue();
		// expect( tool.hasSelectionStrategy( SimpleControlPoint.name ) ).toBeTrue();
		// expect( tool.hasSelectionStrategy( TvLane.name ) ).toBeTrue();
		expect( tool.hasSelectionStrategy( TvRoad.name ) ).toBeTrue();

	} );

} );
