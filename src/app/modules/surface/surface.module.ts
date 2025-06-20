/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { SurfaceTool } from "./surface.tool";
import { SurfaceToolService } from "./surface-tool.service";
import { SurfaceService } from "../../map/surface/surface.service";
import { SurfaceVisualizer } from './visualizers/surface-visualizer';
import { SurfacePointVisualizer } from './visualizers/surface-point-visualizer';
import { SurfaceController } from './controllers/surface-controller';
import { SurfaceControlPointController } from './controllers/surface-point-controller';
import { SurfaceCreationStrategy, SurfacePointCreationStrategy } from './services/surface-creation-strategy';
import { SurfacePointDragHandler } from './services/surface-strategies';
import { SurfaceToolTextureAssetHandler } from './services/surface-tool-texture-asset-handler';


const Controllers = [
	SurfaceController,
	SurfaceControlPointController,
];

const Services = [
	SurfaceToolService,
	SurfaceService,

	SurfacePointCreationStrategy,
	SurfaceCreationStrategy,
	SurfacePointDragHandler,
	SurfaceToolTextureAssetHandler,
];

const Views = [
	SurfaceVisualizer,
	SurfacePointVisualizer,
];


@NgModule( {
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		...Controllers,
		...Services,
		...Views,
		{
			provide: TOOL_PROVIDERS,
			useClass: SurfaceTool,
			deps: [ SurfaceToolService ],
			multi: true,
		},
	]
} )
export class SurfaceToolModule { }
