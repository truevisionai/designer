/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from '../../core/utils/console';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionCategory, ConditionType, Rule } from '../models/tv-enums';

/**
 * This condition acts as a wrapper for external custom conditions
 * which are implemented in the simulation user software. It can
 * compare e.g. complex types, which are not covered by the
 * primitive types of OpenSCENARIO (boolean, int, double...).
 * This condition is considered true if the given external value
 * verifies the specified relation rule (<, <=, ==, >=, >)
 * relatively to the provided reference value.
 * The external value can only be set from outside the scenario.
 * Therefore this condition creates an interface from the scenario
 * to the simulator or other components (e.g. test software,
 * test case, system under test or simulation models).
 */
export class UserDefinedValueCondition extends Condition {

	public category: ConditionCategory = ConditionCategory.ByValue;
	public conditionType: ConditionType = ConditionType.UserDefinedValue;
	public label: string = 'UserDefinedValueCondition';

	constructor (
		public attr_name: string,
		public attr_value: string,
		public attr_rule: Rule
	) {
		super();
		TvConsole.warn( 'UserDefinedValueCondition is not implemented yet' );
	}

	hasPassed (): boolean {
		return false;
	}
}
