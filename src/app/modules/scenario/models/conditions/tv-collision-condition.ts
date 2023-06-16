/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, ScenarioObjectType } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

export class CollisionCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_Collision;

	// either name or type
	public entityName: string;
	public entityType: ScenarioObjectType;

	constructor () {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
