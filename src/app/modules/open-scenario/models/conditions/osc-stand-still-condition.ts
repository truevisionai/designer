/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class StandStillCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_StandStill;

	constructor ( public duration: number ) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
