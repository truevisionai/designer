/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { ConditionUtils } from '../../builders/condition-utils';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

/**
 * Compares a triggering entity's/entities' speed to a target speed.
 * The logical operator for the comparison is given by the rule attribute.
 */
export class SpeedCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_Speed;

	/**
	 * @param value Speed value of the speed condition. Unit m/s
	 * @param rule The operator (less, greater, equal). See {@link Rule}
	 */
	constructor ( public value: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			for ( const entityName of this.triggeringEntities ) {

				const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );

				const passed = ConditionUtils.hasRulePassed( this.rule, entity.speed, this.value );

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

}
