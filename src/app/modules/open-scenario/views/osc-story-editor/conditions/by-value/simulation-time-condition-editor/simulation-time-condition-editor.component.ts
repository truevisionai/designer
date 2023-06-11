import { Component, Input, OnInit } from '@angular/core';
import { OscSimulationTimeCondition } from 'app/modules/open-scenario/models/conditions/osc-simulation-time-condition';

@Component( {
	selector: 'app-simulation-time-condition-editor',
	templateUrl: './simulation-time-condition-editor.component.html',
	styleUrls: [ './simulation-time-condition-editor.component.css' ]
} )
export class SimulationTimeConditionEditorComponent implements OnInit {

	@Input() condition: OscSimulationTimeCondition;

	constructor () {
	}

	ngOnInit () {


	}

}
