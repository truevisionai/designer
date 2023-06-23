/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, ScenarioObjectType } from '../tv-enums';
import { EntityCondition } from './entity-condition';

export class CollisionCondition extends EntityCondition {

	public label: string = 'CollisionCondition';

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
