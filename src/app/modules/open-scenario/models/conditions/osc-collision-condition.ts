import { OscConditionType, OscObjectType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscCollisionCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_Collision;

	// either name or type
	public entityName: string;
	public entityType: OscObjectType;

	constructor () {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
