/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { SimulationTimeCondition } from 'app/modules/open-scenario/models/conditions/osc-simulation-time-condition';

@Component( {
	selector: 'app-simulation-time-condition-editor',
	templateUrl: './simulation-time-condition-editor.component.html',
	styleUrls: [ './simulation-time-condition-editor.component.css' ]
} )
export class SimulationTimeConditionEditorComponent implements OnInit {

	@Input() condition: SimulationTimeCondition;

	constructor () {
	}

	ngOnInit () {


	}

}
