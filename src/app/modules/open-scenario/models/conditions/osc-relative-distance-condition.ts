import { OscConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscRelativeDistanceCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_RelativeDistance;

	hasPassed (): boolean {
		return false;
	}

}
