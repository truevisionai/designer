/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DistanceCondition } from 'app/modules/scenario/models/conditions/tv-distance-condition';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from '../../../../../services/command-history';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { Position } from '../../../models/position';
import { Rule } from '../../../models/tv-enums';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-distance-condition',
	templateUrl: './distance-condition.component.html',
	styleUrls: [ './distance-condition.component.css' ]
} )
export class DistanceConditionComponent extends BaseConditionEditorComponent {

	@Input() condition: EntityCondition;

	rules = Rule;

	constructor () {

		super();

	}

	get distanceCondition () {

		return this.condition as DistanceCondition;

	}

	onPositionChanged ( position: Position ) {

		CommandHistory.execute(
			new SetValueCommand( this.distanceCondition, 'position', position )
		);

	}

	onDistanceChanged ( $event: any ) {

		this.distanceCondition.value = $event;

	}

	onRuleChanged ( $event: Rule ) {

		this.distanceCondition.rule = $event;

	}
}
