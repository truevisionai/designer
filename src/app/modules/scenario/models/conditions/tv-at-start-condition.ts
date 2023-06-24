/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, StoryboardElementType } from '../tv-enums';
import { StateCondition } from './state-condition';

export class AtStartCondition extends StateCondition {

	public label: string = 'AtStartCondition';

	public readonly conditionType = ConditionType.ByState_AtStart;

	constructor ( public elementName: string, public type: StoryboardElementType ) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
