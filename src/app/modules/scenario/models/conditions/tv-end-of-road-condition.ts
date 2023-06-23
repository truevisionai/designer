/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * Condition becomes true after the triggering entity/entities
 * has reached the end of a road for a given amount of time.
 */
export class EndOfRoadCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_EndOfRoad;
	public label: string = 'EndOfRoadCondition';

	private tmpDurations: Map<string, number> = new Map();

	/**
	 * Amount of time at end of road. Unit: s; Range: [0..inf[.
	 * @param duration
	 */
	constructor ( public duration: number = 0 ) {
		super();
	}

	hasPassed (): boolean {

		const passed: boolean[] = this.triggeringEntities.map( entityName => {

			const isEndOfRoad = this.getEntity( entityName ).isAtEndOfRoad();

			if ( isEndOfRoad ) {

				if ( !this.tmpDurations.has( entityName ) ) {

					this.tmpDurations.set( entityName, 0 );

				}

				const newDuration = this.tmpDurations.get( entityName ) + Time.fixedDeltaTime * 0.001;

				this.tmpDurations.set( entityName, newDuration );

			} else {

				this.tmpDurations.set( entityName, 0 );

			}

			return this.tmpDurations.get( entityName ) >= this.duration;

		} );

		if ( this.triggeringRule === TriggeringRule.Any ) {

			return passed.some( p => p );

		} else if ( this.triggeringRule === TriggeringRule.All ) {

			return passed.every( p => p );

		} else {

			return false;

		}

	}

	reset () {

		super.reset();

		this.tmpDurations.clear();

	}

}
