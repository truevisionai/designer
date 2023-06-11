/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionService } from '../condition-service';
import { ConditionCategory, ConditionEdge, ConditionType, Rule, TriggeringRule } from '../osc-enums';

// export class DontUse_Condition {

//     private name: string;
//     private delay: number;
//     private edge: ConditionEdge;

// }

export abstract class AbstractCondition {

	public abstract category: ConditionCategory;
	public abstract conditionType: ConditionType;
	public name: string = '';
	public delay: number = 0;
	public edge: ConditionEdge = ConditionEdge.any;
	public passed: boolean;

	constructor () {
	}

	abstract hasPassed (): boolean;

	hasRulePassed ( rule: Rule, left: number, right: number ): boolean {
		return ConditionService.hasRulePassed( rule, left, right );
	}

	reset () {
		this.passed = false;
	}
}

export abstract class AbstractByEntityCondition extends AbstractCondition {

	public category: ConditionCategory = ConditionCategory.ByEntity;

	public triggeringRule: TriggeringRule = TriggeringRule.Any;

	// name of all entities which can affect this condition
	public entities: string[] = [];

}

export abstract class AbstractByValueCondition extends AbstractCondition {

	public category: ConditionCategory = ConditionCategory.ByValue;

}

export abstract class AbstractByStateCondition extends AbstractCondition {

	public category: ConditionCategory = ConditionCategory.ByState;

}

