/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicControlPoint } from '../../../modules/three-js/objects/dynamic-control-point';
import { TvSurface } from '../../../modules/tv-map/models/tv-surface.model';
import { CatmullRomSpline } from '../../shapes/catmull-rom-spline';
import { SelectSurfaceCommand } from './select-surface-command';
import { SurfaceTool } from './surface-tool';

describe( 'SelectSurfaceCommand when oldSurface and oldPoint are null', () => {
	let tool: SurfaceTool;
	let newSurface: TvSurface;
	let command: SelectSurfaceCommand;

	beforeEach( () => {
		tool = new SurfaceTool();
		newSurface = new TvSurface( 'grass', new CatmullRomSpline() );
		command = new SelectSurfaceCommand( tool, newSurface );
	} );

	it( 'should initialize correctly', () => {
		expect( command[ 'tool' ] ).toBe( tool );
		expect( command[ 'newSurface' ] ).toBe( newSurface );
		expect( command[ 'oldSurface' ] ).toBeUndefined();
		expect( command[ 'oldPoint' ] ).toBeUndefined();
	} );

	it( 'should execute correctly', () => {
		command.execute();
		expect( tool.surface ).toBe( newSurface );
		expect( tool.point ).toBeNull();
	} );

	it( 'should undo correctly', () => {
		command.undo();
		expect( tool.surface ).toBeUndefined();
		expect( tool.point ).toBeUndefined(); // or whatever the initial state should be
	} );

	it( 'should redo correctly', () => {
		command.redo();
		expect( tool.surface ).toBe( newSurface );
		expect( tool.point ).toBeNull();
	} );
} );

describe( 'SelectSurfaceCommand when oldSurface and oldPoint are not null', () => {
	let tool: SurfaceTool;
	let newSurface: TvSurface;
	let oldSurface: TvSurface;
	let oldPoint: DynamicControlPoint<TvSurface>;
	let command: SelectSurfaceCommand;

	beforeEach( () => {
		tool = new SurfaceTool();
		newSurface = new TvSurface( 'grass', new CatmullRomSpline() );
		oldSurface = new TvSurface( 'grass', new CatmullRomSpline() );
		oldPoint = new DynamicControlPoint<TvSurface>( oldSurface );

		// setting the initial tool state
		tool.surface = oldSurface;
		tool.point = oldPoint;

		command = new SelectSurfaceCommand( tool, newSurface );
	} );

	it( 'should initialize correctly', () => {
		expect( command[ 'tool' ] ).toBe( tool );
		expect( command[ 'newSurface' ] ).toBe( newSurface );
		expect( command[ 'oldSurface' ] ).toBe( oldSurface );
		expect( command[ 'oldPoint' ] ).toBe( oldPoint );
	} );

	it( 'should execute correctly', () => {
		const unselectSpy = spyOn( DynamicControlPoint.prototype, 'unselect' );
		command.execute();
		expect( tool.surface ).toBe( newSurface );
		expect( tool.point ).toBeNull();
		expect( unselectSpy ).toHaveBeenCalled();
	} );

	it( 'should undo correctly', () => {
		const selectSpy = spyOn( DynamicControlPoint.prototype, 'select' );
		command.undo();
		expect( tool.surface ).toBe( oldSurface );
		expect( tool.point ).toBe( oldPoint );
		expect( selectSpy ).toHaveBeenCalled();
	} );

	it( 'should redo correctly', () => {
		const unselectSpy = spyOn( DynamicControlPoint.prototype, 'unselect' );
		command.redo();
		expect( tool.surface ).toBe( newSurface );
		expect( tool.point ).toBeNull();
		expect( unselectSpy ).toHaveBeenCalled();
	} );
} );
