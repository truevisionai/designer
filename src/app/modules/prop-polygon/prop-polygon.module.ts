/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropPolygonService } from 'app/map/prop-polygon/prop-polygon.service';
import { PropPolygonToolService, PropPolygonTool } from 'app/modules/prop-polygon/prop-polygon.tool';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { PropPolygonPointController } from './controllers/prop-polygon-point-controller.service';
import { PropPolygonController } from './controllers/prop-polygon-controller.service';
import { PropPolygonCreator, PropPolygonPointCreator } from './creator';
import { PropPolygonPointVisualizer, PropPolygonVisualizer } from './visualiser';


const Controllers = [
	PropPolygonController,
	PropPolygonPointController,
];

const Services = [
	PropPolygonToolService,
	PropPolygonService,
	// PropPolygonPointDragHandler,
	PropPolygonCreator,
	PropPolygonPointCreator,
];

const Views = [
	// PropPolygonToolDebugger,
	PropPolygonVisualizer,
	PropPolygonPointVisualizer,
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
			useClass: PropPolygonTool,
			deps: [ PropPolygonToolService ],
			multi: true,
		},
	]
} )
export class PropPolygonModule { }
