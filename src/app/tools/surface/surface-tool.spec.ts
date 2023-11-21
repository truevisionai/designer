/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { SurfaceTool } from './surface-tool';
import { SurfaceToolService } from './surface-tool.service';

describe( 'SurfaceTool', () => {

	let surfaceTool: SurfaceTool;
	let surfaceService: SurfaceToolService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ SurfaceToolService ],
		} );

		surfaceService = TestBed.inject( SurfaceToolService );

		surfaceTool = new SurfaceTool( surfaceService );

	} );

	beforeEach( () => {

		surfaceTool.init();

		// dummy
		expect( surfaceService.base.getSelectionStrategies().length ).toBe( 1 );

	} );


} );
