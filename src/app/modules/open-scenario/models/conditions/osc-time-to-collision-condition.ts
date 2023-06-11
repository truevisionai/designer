/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscTimeToCollisionCondition extends AbstractByEntityCondition {

	// TODO: Implmement this

	conditionType = OscConditionType.ByEntity_TimeToCollision;

	constructor () {

		super();


	}

	hasPassed (): boolean {
		return false;
	}

}
