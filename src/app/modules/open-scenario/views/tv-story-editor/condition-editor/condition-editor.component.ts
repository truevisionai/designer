/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/tv-condition';
import { DistanceCondition } from '../../../models/conditions/tv-distance-condition';
import { SimulationTimeCondition } from '../../../models/conditions/tv-simulation-time-condition';
import { ConditionType } from '../../../models/tv-enums';

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
		return ConditionType;
	}

	ngOnInit () {


	}

	onConditionTypeChanged ( e ) {

		switch ( e ) {

			case this.types.ByEntity_Distance:
				this.condition = new DistanceCondition();
				break;

			case this.types.ByValue_SimulationTime:
				this.condition = new SimulationTimeCondition();
				break;

			default:
				break;

		}

		this.conditionChanged.emit( this.condition );

	}

}
