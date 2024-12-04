/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { Rule, TriggeringRule } from '../models/tv-enums';

export class ConditionUtils {

	static hasRulePassed ( rule: Rule, left: number, right: number ): boolean {

		let hasPassed = false;

		switch ( rule ) {

			case Rule.GreaterThan:
				return hasPassed = left > right;
				break;

			case Rule.LessThan:
				return hasPassed = left < right;
				break;

			case Rule.EqualTo:
				return hasPassed = left == right;
				break;

		}

		return hasPassed;
	}

	static hasGroupsPassed ( groups: ConditionGroup[], rule: TriggeringRule = TriggeringRule.All ): boolean {

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

	static hasGroupPassed ( group: ConditionGroup, rule: TriggeringRule = TriggeringRule.All ): boolean {

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
