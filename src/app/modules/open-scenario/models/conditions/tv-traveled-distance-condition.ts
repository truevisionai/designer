/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { AbstractByEntityCondition } from './tv-condition';


export class TraveledDistanceCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_TraveledDistance;

	constructor ( public value: number ) {
		super();
	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			for ( const entityName of this.entities ) {

				const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );

				const passed = entity.distanceTravelled >= this.value;

				if ( passed && this.triggeringRule === TriggeringRule.Any ) {

					this.passed = true;

					break;
				}

				if ( !passed && this.triggeringRule === TriggeringRule.All ) {

					this.passed = false;

					break;

				}

			}

			return this.passed;

		}
	}

}
