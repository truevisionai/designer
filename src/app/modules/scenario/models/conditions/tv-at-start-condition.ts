/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, StoryElementType } from '../tv-enums';
import { StateCondition } from './state-condition';

export class AtStartCondition extends StateCondition {

	public label: string = 'AtStartCondition';

	public readonly conditionType = ConditionType.ByState_AtStart;

	constructor ( public elementName: string, public type: StoryElementType ) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
