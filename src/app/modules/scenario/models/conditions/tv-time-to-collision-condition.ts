/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../tv-enums';
import { EntityCondition } from './entity-condition';

export class TimeToCollisionCondition extends EntityCondition {

	public name: string = 'TimeToCollisionCondition';

	// TODO: Implmement this

	conditionType = ConditionType.ByEntity_TimeToCollision;

	constructor () {

		super();


	}

	hasPassed (): boolean {
		return false;
	}

}
