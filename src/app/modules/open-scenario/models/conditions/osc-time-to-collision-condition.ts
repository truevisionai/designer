/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class TimeToCollisionCondition extends AbstractByEntityCondition {

	// TODO: Implmement this

	conditionType = ConditionType.ByEntity_TimeToCollision;

	constructor () {

		super();


	}

	hasPassed (): boolean {
		return false;
	}

}
