import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';
import { OscSimulationTimeCondition } from '../../../models/conditions/osc-simulation-time-condition';
import { OscDistanceCondition } from '../../../models/conditions/osc-distance-condition';
import { OscConditionType } from '../../../models/osc-enums';

@Component( {
	selector: 'app-condition-editor',
	templateUrl: './condition-editor.component.html',
	styleUrls: [ './condition-editor.component.css' ]
} )
export class ConditionEditorComponent implements OnInit {

	get types () { return OscConditionType; }

	@Input() condition: AbstractCondition;

	@Output() conditionChanged = new EventEmitter<AbstractCondition>();

	constructor () { }

	ngOnInit () {


	}

	onConditionTypeChanged ( e ) {

		switch ( e ) {

			case this.types.ByEntity_Distance:
				this.condition = new OscDistanceCondition();
				break;

			case this.types.ByValue_SimulationTime:
				this.condition = new OscSimulationTimeCondition();
				break;

			default:
				break;

		}

		this.conditionChanged.emit( this.condition );

	}

}
