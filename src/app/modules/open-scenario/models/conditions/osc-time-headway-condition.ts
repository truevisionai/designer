/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, Rule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class TimeHeadwayCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_TimeHeadway;

	constructor (
		public entity: string,
		public value: number,
		public freespace: boolean,
		public alongRoute: boolean,
		public rule: Rule
	) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
