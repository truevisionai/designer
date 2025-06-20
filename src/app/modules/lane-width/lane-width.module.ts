/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaneWidthTool } from './services/lane-width-tool';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { LaneWidthToolService } from './services/lane-width-tool.service';
import { LaneWidthService } from './services/lane-width.service';
import { LaneWidthToolDebugger } from './services/lane-width-tool.debugger';
import { LaneWidthLaneController } from './controllers/lane-width-lane-controller';
import { LaneWidthLineController } from './controllers/lane-width-line-controller';
import { LaneWidthLineDragHandler } from './controllers/lane-width-line-drag-handler';
import { LaneWidthNodeController } from './controllers/lane-width-node-controller';
import { LaneWidthPointController } from './controllers/lane-width-point-controller';
import { LaneWidthPointDragHandler } from './controllers/lane-width-point-drag-handler';
import { LaneWidthRoadController } from './controllers/lane-width-road-controller';
import { LaneWidthCreationStrategy } from './services/lane-width-creation-strategy';
import { LaneWidthLineVisualizer } from './visualizers/lane-width-line-visualizer';
import { LaneWidthNodeVisualizer } from './visualizers/lane-width-node-visualizer';
import { LaneWidthPointVisualizer } from './visualizers/lane-width-point-visualizer';
import { LaneWidthRoadVisualizer } from './visualizers/lane-width-road-visualizer';

@NgModule( {
	declarations: [],
	imports: [
		CommonModule
	],
	providers: [

		// controllers
		LaneWidthLaneController,
		LaneWidthLineController,
		LaneWidthLineDragHandler,
		LaneWidthNodeController,
		LaneWidthPointController,
		LaneWidthPointDragHandler,
		LaneWidthRoadController,

		LaneWidthLineVisualizer,
		LaneWidthNodeVisualizer,
		LaneWidthPointVisualizer,
		LaneWidthRoadVisualizer,

		// services
		LaneWidthCreationStrategy,
		LaneWidthToolDebugger,
		LaneWidthService,
		LaneWidthToolService,

		// tool
		{
			provide: TOOL_PROVIDERS,
			useFactory: ( injector: Injector ) => {
				const laneWidthToolService = injector.get( LaneWidthToolService );
				return new LaneWidthTool( laneWidthToolService );
			},
			deps: [ Injector ],  // Use the module's injector to resolve dependencies
			multi: true,
		},
	]
} )
export class LaneWidthModule {
}
