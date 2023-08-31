/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { Condition } from 'app/modules/scenario/models/conditions/tv-condition';
import { OffRoadCondition } from 'app/modules/scenario/models/conditions/tv-off-road-condition';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-off-road-condition-editor',
	templateUrl: './off-road-condition-editor.component.html',
	styleUrls: [ './off-road-condition-editor.component.scss' ]
} )
export class OffRoadConditionEditorComponent {

	@Input() condition: Condition;

	get offRoadCondition () {

		return this.condition as OffRoadCondition;

	}

	onDurationChanged ( $duration: number ) {

		CommandHistory.execute( new SetValueCommand( this.offRoadCondition, 'duration', $duration ) );

	}

}
