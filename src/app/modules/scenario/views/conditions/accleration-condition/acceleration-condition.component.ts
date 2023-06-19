import { Component, Input } from '@angular/core';
import { AccelerationCondition } from 'app/modules/scenario/models/conditions/tv-acceleration-condition';
import { Condition } from '../../../models/conditions/tv-condition';
import { Rule } from '../../../models/tv-enums';

@Component( {
	selector: 'app-acceleration-condition',
	templateUrl: './acceleration-condition.component.html',
	styleUrls: [ './acceleration-condition.component.scss' ]
} )
export class AccelerationConditionComponent {

	@Input() condition: Condition;

	rules = Rule;

	get accelerationCondition (): AccelerationCondition {

		return this.condition as AccelerationCondition;

	}

	onRuleChanged ( $rule: Rule ) {

		this.accelerationCondition.rule = $rule;

	}

	onAccelerationChanged ( $value: number ) {

		this.accelerationCondition.value = $value;

	}
}
