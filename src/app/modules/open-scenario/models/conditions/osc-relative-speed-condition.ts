/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { OscConditionType, OscRule, OscTriggeringRule } from '../osc-enums';
import { ConditionService } from '../condition-service';
import { AbstractByEntityCondition } from './osc-condition';

export class OscRelativeSpeedCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_RelativeSpeed;

	constructor ( public entity: string, public value: number, public rule: OscRule ) {

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
				if ( passed && this.triggeringRule === OscTriggeringRule.Any ) {

					this.passed = true;

					break;
				}

				// exit if any of the entity distance is not passed
				if ( !passed && this.triggeringRule === OscTriggeringRule.All ) {

					this.passed = false;

					break;

				}

			}

			return this.passed;

		}

	}

}
