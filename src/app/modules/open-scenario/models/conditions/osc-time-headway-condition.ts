import { OscConditionType, OscRule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscTimeHeadwayCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_TimeHeadway;

	constructor (
		public entity: string,
		public value: number,
		public freespace: boolean,
		public alongRoute: boolean,
		public rule: OscRule
	) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
