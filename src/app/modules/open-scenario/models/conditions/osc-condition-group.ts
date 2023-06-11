import { AbstractCondition } from './osc-condition';

export class OscConditionGroup {

	public conditions: AbstractCondition[] = [];

	addCondition ( condition: AbstractCondition ) {
		this.conditions.push( condition );
	}

}
