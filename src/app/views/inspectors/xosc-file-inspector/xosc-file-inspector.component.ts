/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { TvScenario } from 'app/scenario/models/tv-scenario';

@Component( {
	selector: 'app-xosc-file-inspector',
	templateUrl: './xosc-file-inspector.component.html',
	styleUrls: [ './xosc-file-inspector.component.scss' ]
} )
export class XoscFileInspectorComponent implements OnInit, IComponent {

	data: TvScenario;

	constructor () {
	}

	ngOnInit () {
	}

}
