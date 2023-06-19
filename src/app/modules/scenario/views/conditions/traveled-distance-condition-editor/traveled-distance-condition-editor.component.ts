/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { TraveledDistanceCondition } from 'app/modules/scenario/models/conditions/tv-traveled-distance-condition';
import { CommandHistory } from '../../../../../services/command-history';
import { SetValueCommand } from '../../../../three-js/commands/set-value-command';
import { Condition } from '../../../models/conditions/tv-condition';

@Component( {
	selector: 'app-traveled-distance-condition-editor',
	templateUrl: './traveled-distance-condition-editor.component.html',
	styleUrls: [ './traveled-distance-condition-editor.component.css' ]
} )
export class TraveledDistanceConditionEditorComponent {

	@Input() condition: Condition;

	get distanceCondition () {
		return this.condition as TraveledDistanceCondition;
	}

	onDistanceValueChanged ( value: number ) {

		CommandHistory.execute(
			new SetValueCommand( this.distanceCondition, 'value', value )
		);

	}
}
