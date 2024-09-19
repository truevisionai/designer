import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { PointerEventData } from "app/events/pointer-event-data";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { ToolManager } from "app/managers/tool-manager";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvLineGeometry } from "app/map/models/geometries/tv-line-geometry";
import { TvMap } from "app/map/models/tv-map.model";
import { RoadService } from "app/services/road/road.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { BaseTool } from "app/tools/base-tool";
import { ToolType } from "app/tools/tool-types.enum";
import { ToolBarService } from "app/views/editor/tool-bar/tool-bar.service";
import { Vector3 } from "three";


describe( 'ExplicitSplineEditing test', () => {

	let spline: AbstractSpline;
	let helper: SplineTestHelper;
	let map: TvMap;
	let tool: BaseTool<any>;

	beforeEach( async () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		helper = TestBed.inject( SplineTestHelper );

		map = await helper.loadStraightXodr();

		tool = TestBed.inject( ToolBarService ).setToolByType( ToolType.Road ) as BaseTool<any>;

		TestBed.inject( EventServiceProvider ).init();

		spline = map.getSplines()[ 0 ];

	} );

	it( 'should add control point when explicit is selected', () => {

		tool.onObjectSelected( spline );

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		tool.onPointerDownCreate( event );

		expect( spline.getControlPointCount() ).toBe( 3 );

	} );

	it( 'should should add arc geometry when point is added', () => {

		tool.onObjectSelected( spline );

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		tool.onPointerDownCreate( event );

		expect( spline.getGeometryCount() ).toBe( 2 );

		expect( spline.getGeometries()[ 0 ] ).toBeInstanceOf( TvLineGeometry );

		expect( spline.getGeometries()[ 1 ] ).toBeInstanceOf( TvLineGeometry );

	} );

} );
