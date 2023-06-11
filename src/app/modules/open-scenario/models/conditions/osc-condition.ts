/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscConditionCategory, OscConditionEdge, OscConditionType, OscRule, OscTriggeringRule } from '../osc-enums';
import { ConditionService } from '../condition-service';

// export class DontUse_OscCondition {

//     private name: string;
//     private delay: number;
//     private edge: OscConditionEdge;

// }

export abstract class AbstractCondition {

	public abstract category: OscConditionCategory;
	public abstract conditionType: OscConditionType;
	public name: string = '';
	public delay: number = 0;
	public edge: OscConditionEdge = OscConditionEdge.any;
	public passed: boolean;

	constructor () {
	}

	abstract hasPassed (): boolean;

	hasRulePassed ( rule: OscRule, left: number, right: number ): boolean {
		return ConditionService.hasRulePassed( rule, left, right );
	}

}

export abstract class AbstractByEntityCondition extends AbstractCondition {

	public category: OscConditionCategory = OscConditionCategory.ByEntity;

	public triggeringRule: OscTriggeringRule = OscTriggeringRule.Any;

	// name of all entities which can affect this condition
	public entities: string[] = [];

}

export abstract class AbstractByValueCondition extends AbstractCondition {

	public category: OscConditionCategory = OscConditionCategory.ByValue;

}

export abstract class AbstractByStateCondition extends AbstractCondition {

	public category: OscConditionCategory = OscConditionCategory.ByState;

}

