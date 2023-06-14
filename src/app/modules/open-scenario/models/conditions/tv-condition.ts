/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionService } from '../../builders/condition-service';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionCategory, ConditionEdge, ConditionType, Rule } from '../tv-enums';

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

	protected get scenario () {
		return TvScenarioInstance.scenario;
	}
}

