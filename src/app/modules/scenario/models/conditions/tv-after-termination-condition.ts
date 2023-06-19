/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterTerminationRule, ConditionType, StoryElementType } from '../tv-enums';
import { StateCondition } from './state-condition';

export class AfterTerminationCondition extends StateCondition {

	public name: string = 'AfterTerminationCondition';

	public readonly conditionType = ConditionType.ByState_AfterTermination;

	constructor (
		public elementName: string,
		public type: StoryElementType,
		public rule: AfterTerminationRule
	) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
