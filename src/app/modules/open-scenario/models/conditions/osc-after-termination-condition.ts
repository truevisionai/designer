import { AbstractByStateCondition } from './osc-condition';
import { OscAfterTerminationRule, OscConditionType, OscStoryElementType } from '../osc-enums';

export class OscAfterTerminationCondition extends AbstractByStateCondition {

	public readonly conditionType = OscConditionType.ByState_AfterTermination;

	constructor (
		public elementName: string,
		public type: OscStoryElementType,
		public rule: OscAfterTerminationRule
	) {

		super();

	}

	hasPassed (): boolean {
		return false;
	}

}
