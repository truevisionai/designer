/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class RelativeDistanceCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_RelativeDistance;

	hasPassed (): boolean {
		return false;
	}

}
