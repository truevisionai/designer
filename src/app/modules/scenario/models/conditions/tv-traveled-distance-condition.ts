/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';


export class TraveledDistanceCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_TraveledDistance;
	public name: string = 'TraveledDistanceCondition';

	constructor ( public value: number, triggeringRule = TriggeringRule.Any, triggeringEntities: string[] = [] ) {
		super();
		this.triggeringRule = triggeringRule;
		this.triggeringEntities = triggeringEntities;
	}

	hasPassed (): boolean {

		if ( this.passed ) return true;

		const distances = this.triggeringEntities.map( entityName => {

			const entity = this.scenario.findEntityOrFail( entityName );

			return entity.distanceTravelled >= this.value;

		} );


		if ( this.triggeringRule === TriggeringRule.Any ) {

			this.passed = distances.some( d => d );

		} else if ( this.triggeringRule === TriggeringRule.All ) {

			this.passed = distances.every( d => d );

		}

		return this.passed;

	}

}
