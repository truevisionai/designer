import { OscConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscEndOfRoadCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_EndOfRoad;

	constructor ( public duration: number ) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
