/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { SimulationTimeCondition } from 'app/modules/scenario/models/conditions/tv-simulation-time-condition';
import { AbstractCondition } from '../../../../models/conditions/tv-condition';
import { Rule } from '../../../../models/tv-enums';

@Component( {
	selector: 'app-simulation-time-condition-editor',
	templateUrl: './simulation-time-condition-editor.component.html',
	styleUrls: [ './simulation-time-condition-editor.component.css' ]
} )
export class SimulationTimeConditionEditorComponent implements OnInit {

	@Input() condition: AbstractCondition;

	rules = Rule;

	constructor () {
	}

	get simulationTimeCondition () {
		return this.condition as SimulationTimeCondition;
	}

	ngOnInit () {


	}

}
