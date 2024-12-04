/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { Condition } from '../../../models/conditions/tv-condition';
import { RelativeSpeedCondition } from '../../../models/conditions/tv-relative-speed-condition';
import { Rule } from '../../../models/tv-enums';

@Component( {
	selector: 'app-relative-speed-condition',
	templateUrl: './relative-speed-condition.component.html',
	styleUrls: [ './relative-speed-condition.component.css' ]
} )
export class RelativeSpeedConditionComponent {

	@Input() condition: Condition;

	rules = Rule;

	get relativeSpeedCondition () {

		return this.condition as RelativeSpeedCondition;

	}

	onTargetEntityChanged ( $entity: string ): void {

		this.relativeSpeedCondition.entity = $entity;

	}

	onRelativeSpeedChanged ( $speed: number ): void {

		this.relativeSpeedCondition.speed = $speed;

	}

	onRuleChanged ( $rule: Rule ): void {

		this.relativeSpeedCondition.rule = $rule;

	}
}
