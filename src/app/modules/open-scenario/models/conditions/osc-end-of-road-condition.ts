/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class EndOfRoadCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_EndOfRoad;

	constructor ( public duration: number ) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
