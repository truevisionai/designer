/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, Rule } from '../tv-enums';
import { ValueCondition } from './value-condition';

/**
 * Compares a named parameter's value to a reference value.
 * The logical operator used for comparison is defined by
 * the rule attribute Less and greater operator will only
 * be supported if the value given as string can
 * unambiguously be converted into a scalar value
 * (e.g. value=5, value=16.667).
 */
export class ParameterCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.Parameter;

	public label: string = 'Parameter Condition';

	constructor ( parameterRef: string, value: string, rule: Rule ) {
		super();
	}

	hasPassed (): boolean {

		return false;

	}

}

/**
 * The logical expression is considered true if the simulated time and
 * date verifies the specified relation rule (bigger than, smaller
 * than, or equal to) relatively to a given time and date value.
 */
export class TimeOfDayCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.TimeOfDay;

	public label: string = 'TimeOfDay Condition';

	constructor ( value: Date, rule: Rule ) {
		super();
		// TODO: parse the value to date-time
		// Date and Time example 2002-05-30T09:30:10 OR $-notated Parameter.
	}

	hasPassed (): boolean {

		return false;

	}

}
