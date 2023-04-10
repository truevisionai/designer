import { AnyControlPoint } from "app/modules/three-js/objects/control-point";
import { SurfaceTool } from "./surface-tool";
import { TvSurface } from "app/modules/tv-map/models/tv-surface.model";
import { DynamicControlPoint } from "app/modules/three-js/objects/prop-control-point";
import { CommandHistory } from "app/services/command-history";
import { CreateSurfaceCommand } from "../commands/create-surface-command";
import { AddSurfaceControlPointCommand } from "../commands/add-surface-control-point-command";

describe( 'SurfaceTool', () => {

	let surfaceTool: SurfaceTool;

	beforeEach( () => {
		surfaceTool = new SurfaceTool();
		surfaceTool.init();
	} );


	it( 'should select the surface and show its control points when a control point is selected', () => {

		const mockSurface: TvSurface = jasmine.createSpyObj<TvSurface>( 'TvSurface', [ 'showControlPoints' ] );

		const point = new DynamicControlPoint( mockSurface );

		surfaceTool.onControlPointSelected( point );

		expect( surfaceTool.surface ).toBe( mockSurface );
		expect( mockSurface.showControlPoints ).toHaveBeenCalled();
	} );

	it( 'should set the surface to null when a control point is unselected', () => {
		surfaceTool.surface = jasmine.createSpyObj<TvSurface>( 'TvSurface', [ 'showControlPoints' ] );
		surfaceTool.onControlPointUnselected();
		expect( surfaceTool.surface ).toBeNull();
	} );

	it( 'should execute CreateSurfaceCommand when there is no surface and a control point is added', () => {
		const cp: AnyControlPoint = new AnyControlPoint();
		spyOn( CommandHistory, 'execute' );
		surfaceTool.onControlPointAdded( cp );
		expect( CommandHistory.execute ).toHaveBeenCalledWith( jasmine.any( CreateSurfaceCommand ) );
	} );

	it( 'should execute AddSurfaceControlPointCommand when there is a surface and a control point is added', () => {
		const cp: AnyControlPoint = new AnyControlPoint();
		surfaceTool.surface = jasmine.createSpyObj<TvSurface>( 'TvSurface', [ 'showControlPoints' ] );
		spyOn( CommandHistory, 'execute' );
		surfaceTool.onControlPointAdded( cp );
		expect( CommandHistory.execute ).toHaveBeenCalledWith( jasmine.any( AddSurfaceControlPointCommand ) );
	} );
} );
