/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, ScenarioObjectType } from '../tv-enums';
import { EntityCondition } from './entity-condition';

export class CollisionCondition extends EntityCondition {

	public label: string = 'CollisionCondition';

	public conditionType = ConditionType.ByEntity_Collision;

	// either name or type
	constructor ( public entityRef: string, public entityType: ScenarioObjectType ) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
