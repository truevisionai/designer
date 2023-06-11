/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractCondition } from './osc-condition';

export class ConditionGroup {

	public conditions: AbstractCondition[] = [];

	addCondition ( condition: AbstractCondition ) {
		this.conditions.push( condition );
	}

	reset () {
		for ( let i = 0; i < this.conditions.length; i++ ) {
			this.conditions[ i ].reset();
		}
	}
}
