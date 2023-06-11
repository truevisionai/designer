/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, Rule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class AccelerationCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_Acceleration;

	constructor ( public value: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
