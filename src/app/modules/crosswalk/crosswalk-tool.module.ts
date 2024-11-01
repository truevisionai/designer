import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { CrosswalkTool } from './crosswalk-tool';
import { CrosswalkToolHelper } from './crosswalk-tool.helper';
import { CrosswalkToolDebugger } from './crosswalk-tool-debugger';
import { CornerControlPointDragHandler } from './controllers/corner-control-point-drag-handler.service';
import { CornerControlPointController } from './controllers/corner-point-controller';
import { CrosswalkController } from './controllers/crosswalk-controller';
import { CornerPointVisualizer } from './visualizers/corner-point-visualizer';
import { CrosswalkToolRoadVisualizer } from './visualizers/crosswalk-tool-road-visualizer';
import { CrosswalkVisualizer } from './visualizers/crosswalk-visualizer';

const Controllers = [
	CornerControlPointController,
	CrosswalkController
];

const Services = [
	CrosswalkToolDebugger,
	CornerControlPointDragHandler
];

const Views = [
	CornerPointVisualizer,
	CrosswalkVisualizer,
	CrosswalkToolRoadVisualizer
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
			useClass: CrosswalkTool,
			deps: [ CrosswalkToolHelper ],
			multi: true,
		},
	]
} )
export class CrosswalkToolModule { }
