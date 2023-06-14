/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { ConditionService } from '../../builders/condition-service';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

export class RelativeSpeedCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_RelativeSpeed;

	constructor ( public entity: string, public value: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			const targetEntity = TvScenarioInstance.openScenario.findEntityOrFail( this.entity );

			for ( const entityName of this.entities ) {

				const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );

				const relativeSpeed = targetEntity.speed - entity.speed;

				const passed = ConditionService.hasRulePassed( this.rule, relativeSpeed, this.value );

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
