/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionGroup } from './conditions/osc-condition-group';
import { Rule, TriggeringRule } from './osc-enums';

export class ConditionService {

	static hasRulePassed ( rule: Rule, left: number, right: number ): boolean {

		let hasPassed = false;

		switch ( rule ) {

			case Rule.greater_than:
				hasPassed = left > right;
				// console.log( left, right, left > right );
				break;

			case Rule.less_than:
				hasPassed = left < right;
				// console.log( left, right, left < right );
				break;

			case Rule.equal_to:
				hasPassed = left == right;
				// console.log( left, right, left == right );
				break;

		}

		return hasPassed;
	}

	static hasGroupsPassed ( groups: ConditionGroup[], rule: TriggeringRule = TriggeringRule.All ) {

		let allGroupsPassed = true;

		for ( const group of groups ) {

			const groupPassed = this.hasGroupPassed( group, rule );

			if ( rule === TriggeringRule.All && !groupPassed ) {

				allGroupsPassed = false;
				break;

			} else if ( rule === TriggeringRule.Any && groupPassed ) {

				allGroupsPassed = true;
				break;
			}
		}

		return allGroupsPassed;
	}

	static hasGroupPassed ( group: ConditionGroup, rule: TriggeringRule = TriggeringRule.All ) {

		let allConditionsPassed = true;

		for ( const condition of group.conditions ) {

			const conditionPassed = condition.hasPassed();

			if ( rule === TriggeringRule.All && !conditionPassed ) {

				allConditionsPassed = false;
				break;

			} else if ( rule === TriggeringRule.Any && conditionPassed ) {

				allConditionsPassed = true;
				break;
			}
		}

		return allConditionsPassed;
	}
}
