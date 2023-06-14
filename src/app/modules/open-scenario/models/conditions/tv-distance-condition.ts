/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { AbstractPosition } from '../tv-interfaces';
import { ConditionService } from '../condition-service';
import { AbstractByEntityCondition } from './tv-condition';

/**
 *
 * @param position
 * @param value
 * @param freespace It determines whether the entities bounding box
 * shall be taken into consideration (freeSpace = true), or shall
 * not be taken into consideration (freeSpace = false).
 * @param alongRoute
 * @param rule
 */
export class DistanceCondition extends AbstractByEntityCondition {

	public readonly conditionType = ConditionType.ByEntity_Distance;


	constructor (
		public position?: AbstractPosition,
		public value?: number,
		public freespace?: boolean,
		public alongRoute?: boolean,
		public rule?: Rule
	) {
		super();
	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			const otherPosition = this.position.toVector3();

			for ( const entityName of this.entities ) {

				const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );

				const distance = entity.position.distanceTo( otherPosition );

				// console.log( 'distance-to-entity', distance );

				const passed = ConditionService.hasRulePassed( this.rule, distance, this.value );

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
