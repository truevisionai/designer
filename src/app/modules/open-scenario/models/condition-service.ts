/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscConditionGroup } from './conditions/osc-condition-group';
import { OscRule, OscTriggeringRule } from './osc-enums';

export class ConditionService {

	static hasRulePassed ( rule: OscRule, left: number, right: number ): boolean {

		let hasPassed = false;

		switch ( rule ) {

			case OscRule.greater_than:
				hasPassed = left > right;
				// console.log( left, right, left > right );
				break;

			case OscRule.less_than:
				hasPassed = left < right;
				// console.log( left, right, left < right );
				break;

			case OscRule.equal_to:
				hasPassed = left == right;
				// console.log( left, right, left == right );
				break;

		}

		return hasPassed;
	}

	static hasGroupsPassed ( groups: OscConditionGroup[], rule: OscTriggeringRule = OscTriggeringRule.All ) {

		let allGroupsPassed = true;

		for ( const group of groups ) {

			const groupPassed = this.hasGroupPassed( group, rule );

			if ( rule === OscTriggeringRule.All && !groupPassed ) {

				allGroupsPassed = false;
				break;

			} else if ( rule === OscTriggeringRule.Any && groupPassed ) {

				allGroupsPassed = true;
				break;
			}
		}

		return allGroupsPassed;
	}

	static hasGroupPassed ( group: OscConditionGroup, rule: OscTriggeringRule = OscTriggeringRule.All ) {

		let allConditionsPassed = true;

		for ( const condition of group.conditions ) {

			const conditionPassed = condition.hasPassed();

			if ( rule === OscTriggeringRule.All && !conditionPassed ) {

				allConditionsPassed = false;
				break;

			} else if ( rule === OscTriggeringRule.Any && conditionPassed ) {

				allConditionsPassed = true;
				break;
			}
		}

		return allConditionsPassed;
	}
}
