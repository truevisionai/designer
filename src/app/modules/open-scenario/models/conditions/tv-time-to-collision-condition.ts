/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

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
