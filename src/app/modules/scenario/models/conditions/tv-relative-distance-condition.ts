/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

export class RelativeDistanceCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_RelativeDistance;

	hasPassed (): boolean {
		return false;
	}

}
