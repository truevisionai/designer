/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, ObjectType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class CollisionCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_Collision;

	// either name or type
	public entityName: string;
	public entityType: ObjectType;

	constructor () {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
