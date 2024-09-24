import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { PointerEventData } from "app/events/pointer-event-data";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { ToolManager } from "app/managers/tool-manager";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvLineGeometry } from "app/map/models/geometries/tv-line-geometry";
import { TvSpiralGeometry } from "app/map/models/geometries/tv-spiral-geometry";
import { TvMap } from "app/map/models/tv-map.model";
import { MapService } from "app/services/map/map.service";
import { RoadService } from "app/services/road/road.service";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { BaseTool } from "app/tools/base-tool";
import { ToolType } from "app/tools/tool-types.enum";
import { breakGeometries } from "app/utils/spline.utils";
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

		TestBed.inject( MapService ).setMap( map );

		TestBed.inject( EventServiceProvider ).init();

		spline = map.getSplines()[ 0 ];

	} );

	it( 'should add control point when explicit is selected', () => {

		tool.onObjectSelected( spline );

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		tool.onPointerDownCreate( event );

		expect( spline.getControlPointCount() ).toBe( 3 );

	} );

	it( 'should should add spiral geometry when point is added', () => {

		tool.onObjectSelected( spline );

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		tool.onPointerDownCreate( event );

		expect( spline.getGeometryCount() ).toBe( 2 );

		expect( spline.getGeometries()[ 0 ] ).toBeInstanceOf( TvLineGeometry );

		expect( spline.getGeometries()[ 1 ] ).toBeInstanceOf( TvSpiralGeometry );

	} );

	it( 'should should add spiral geometry when point is insert', () => {

		tool.onObjectSelected( spline );

		const event = PointerEventData.create( new Vector3( 5, 50, 0 ) );

		tool.onPointerDownCreate( event );

		expect( spline.getGeometryCount() ).toBe( 2 );

		expect( spline.getGeometries()[ 0 ] ).toBeInstanceOf( TvSpiralGeometry );

		expect( spline.getGeometries()[ 1 ] ).toBeInstanceOf( TvSpiralGeometry );

	} );

	it( 'should should break line geometry in half', () => {

		const geometry = new TvLineGeometry( 0, 0, 0, 0, 100 );

		const brokenGeometries = breakGeometries( [ geometry ], 50, 100 );

		expect( brokenGeometries.length ).toBe( 1 );
		expect( brokenGeometries[ 0 ].length ).toBe( 50 );
		expect( brokenGeometries[ 0 ].s ).toBe( 0 );	// TODO: check if this is correct
		expect( brokenGeometries[ 0 ].x ).toBe( 50 );
		expect( brokenGeometries[ 0 ].y ).toBe( 0 );
		expect( brokenGeometries[ 0 ].hdg ).toBe( 0 );

	} );

	it( 'should should break spiral geometry in half', () => {

		const geometry = new TvSpiralGeometry( 0, 0, 0, 0, 100, 0.001, -0.001 );

		const brokenGeometries = breakGeometries( [ geometry ], 50, 100 );

		expect( brokenGeometries.length ).toBe( 1 );
		expect( brokenGeometries[ 0 ].length ).toBe( 50 );

		// TODO: check if bellow asserts correct
		expect( brokenGeometries[ 0 ].s ).toBe( 0 );	// TODO: check if this is correct
		expect( brokenGeometries[ 0 ].x ).toBeCloseTo( 49.99 );
		expect( brokenGeometries[ 0 ].y ).toBeCloseTo( 0.83 );
		expect( brokenGeometries[ 0 ].hdg ).toBeCloseTo( 0.025 );

	} );

} );
