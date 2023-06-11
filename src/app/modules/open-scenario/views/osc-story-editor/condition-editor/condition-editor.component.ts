import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';
import { OscDistanceCondition } from '../../../models/conditions/osc-distance-condition';
import { OscSimulationTimeCondition } from '../../../models/conditions/osc-simulation-time-condition';
import { OscConditionType } from '../../../models/osc-enums';

@Component( {
	selector: 'app-condition-editor',
	templateUrl: './condition-editor.component.html',
	styleUrls: [ './condition-editor.component.css' ]
} )
export class ConditionEditorComponent implements OnInit {

	@Input() condition: AbstractCondition;
	@Output() conditionChanged = new EventEmitter<AbstractCondition>();

	constructor () {
	}

	get types () {
		return OscConditionType;
	}

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
