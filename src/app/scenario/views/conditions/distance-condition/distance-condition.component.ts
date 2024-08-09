/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DistanceCondition } from 'app/scenario/models/conditions/tv-distance-condition';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { Position } from '../../../models/position';
import { Rule } from '../../../models/tv-enums';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';
import { Commands } from 'app/commands/commands';

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

		Commands.SetValue( this.distanceCondition, 'position', position );

	}

	onDistanceChanged ( $event: any ) {

		this.distanceCondition.value = $event;

	}

	onRuleChanged ( $event: Rule ) {

		this.distanceCondition.rule = $event;

	}
}
