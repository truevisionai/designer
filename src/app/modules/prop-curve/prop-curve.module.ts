/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { PropCurveTool, PropCurveToolService } from './prop-curve-tool';
import { PropCurveToolDebugger } from './services/prop-curve-tool.debugger';
import { PropCurveService } from './services/prop-curve.service';
import { PropCurvePointController } from './controllers/prop-curve-point-controller.service';
import { PropCurveController } from './controllers/prop-curve-controller.service';
import { PropCurvePointVisualizer, PropCurveVisualizerService } from './visualizers/prop-curve-visualizer.service';
import { PropCurvePointDragHandler } from './handlers/prop-point-drag-handler';
import { PropCurveCreator } from './services/prop-curve-creator';
import { PropCurvePointCreator } from './services/prop-curve-point-creator';

const Controllers = [
	PropCurveController,
	PropCurvePointController,
];

const Services = [
	PropCurveToolService,
	PropCurveService,
	PropCurvePointDragHandler,
	PropCurveCreator,
	PropCurvePointCreator,
];

const Views = [
	PropCurveToolDebugger,
	PropCurveVisualizerService,
	PropCurvePointVisualizer,
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
			useClass: PropCurveTool,
			deps: [ PropCurveToolService ],
			multi: true,
		},
	]
} )
export class PropCurveModule { }
