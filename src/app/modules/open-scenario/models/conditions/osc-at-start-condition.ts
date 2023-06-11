/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, StoryElementType } from '../osc-enums';
import { AbstractByStateCondition } from './osc-condition';

export class AtStartCondition extends AbstractByStateCondition {

	public readonly conditionType = ConditionType.ByState_AtStart;

	constructor ( public elementName: string, public type: StoryElementType ) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
