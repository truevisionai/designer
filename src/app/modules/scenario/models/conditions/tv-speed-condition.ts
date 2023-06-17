/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

/**
 * Compares a triggering entity's/entities' speed to a target speed.
 * The logical operator for the comparison is given by the rule attribute.
 */
export class SpeedCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_Speed;
	public name: string = 'SpeedCondition';

	/**
	 * @param value Speed value of the speed condition. Unit m/s
	 * @param rule The operator (less, greater, equal). See {@link Rule}
	 */
	constructor ( public value: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {

		if ( this.passed ) return true;

		for ( const entityName of this.triggeringEntities ) {

			const currentSpeed = this.getEntity( entityName ).getCurrentSpeed();

			const passed = ConditionUtils.hasRulePassed( this.rule, currentSpeed, this.value );

			// exit if any of the entity distance is passed
			if ( passed && this.triggeringRule === TriggeringRule.Any ) {

				this.passed = true;

				break;
			}

			// exit if any of the entity distance is not passed
			if ( !passed && this.triggeringRule === TriggeringRule.All ) {

				this.passed = false;

				break;

			}

		}

		return this.passed;
	}

}
