/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { Condition } from 'app/scenario/models/conditions/tv-condition';
import { OffRoadCondition } from 'app/scenario/models/conditions/tv-off-road-condition';
import { Commands } from 'app/commands/commands';

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

		Commands.SetValue( this.offRoadCondition, 'duration', $duration );

	}

}
