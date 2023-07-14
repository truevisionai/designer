/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { Condition } from '../../../models/conditions/tv-condition';
import { RelativeDistanceCondition } from '../../../models/conditions/tv-relative-distance-condition';
import { Rule } from '../../../models/tv-enums';

@Component( {
	selector: 'app-relative-distance-condition',
	templateUrl: './relative-distance-condition.component.html',
	styleUrls: [ './relative-distance-condition.component.scss' ]
} )
export class RelativeDistanceConditionComponent {

	@Input() condition: Condition;

	rules = Rule;

	get relativeDistanceCondition () {

		return this.condition as RelativeDistanceCondition;

	}

	onTargetEntityChanged ( $targetEntity: string ) {

		this.relativeDistanceCondition.targetEntity = $targetEntity;

	}

	onDistanceChanged ( $distance: number ) {

		this.relativeDistanceCondition.distance = $distance;

	}

	onFreespaceChanged ( $freespace: any ) {

		this.relativeDistanceCondition.freespace = $freespace;

	}

	onRuleChanged ( $rule: Rule ) {

		this.relativeDistanceCondition.rule = $rule;

	}
}
