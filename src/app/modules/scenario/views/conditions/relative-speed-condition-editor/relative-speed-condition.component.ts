/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractCondition } from '../../../models/conditions/tv-condition';
import { RelativeSpeedCondition } from '../../../models/conditions/tv-relative-speed-condition';
import { Rule } from '../../../models/tv-enums';

@Component( {
	selector: 'app-relative-speed-condition',
	templateUrl: './relative-speed-condition.component.html',
	styleUrls: [ './relative-speed-condition.component.css' ]
} )
export class RelativeSpeedConditionComponent {

	@Input() condition: AbstractCondition;

	rules = Rule;

	get relativeSpeedCondition () {

		return this.condition as RelativeSpeedCondition;

	}

	onTargetEntityChanged ( $entity: string ) {

		this.relativeSpeedCondition.entity = $entity;

	}

	onRelativeSpeedChanged ( $speed: number ) {

		this.relativeSpeedCondition.speed = $speed;

	}

	onRuleChanged ( $rule: Rule ) {

		this.relativeSpeedCondition.rule = $rule;

	}
}
