/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { TraveledDistanceCondition } from 'app/scenario/models/conditions/tv-traveled-distance-condition';
import { CommandHistory } from '../../../../commands/command-history';
import { SetValueCommand } from '../../../../commands/set-value-command';
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
