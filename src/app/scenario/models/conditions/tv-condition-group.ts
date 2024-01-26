/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Condition } from './tv-condition';

export class ConditionGroup {

	public conditions: Condition[] = [];

	addCondition ( condition: Condition ) {
		this.conditions.push( condition );
	}

	reset () {
		for ( let i = 0; i < this.conditions.length; i++ ) {
			this.conditions[ i ].reset();
		}
	}
}
