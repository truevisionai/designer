/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

export class EndOfRoadCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_EndOfRoad;

	constructor ( public duration: number ) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
