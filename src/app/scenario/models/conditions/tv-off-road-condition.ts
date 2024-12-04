/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../core/time';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * Checks if an entity is of the road.
 * The logical expression returns true after
 * the entity has been offroad for a specific duration.
 */
export class OffRoadCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_Offroad;
	public label: string = 'OffRoadCondition';

	public tmpDurations: Map<string, number> = new Map();

	/**
	 * Amount of time of driving offroad. Unit: s; Range: [0..inf[.
	 * @param duration
	 */
	constructor ( public duration: number = 0 ) {
		super();
	}

	hasPassed (): boolean {

		const passed: boolean[] = this.triggeringEntities.map( entityName => {

			const entity = this.getEntity( entityName );

			const isOffRoad = entity.isOffRoad();

			if ( isOffRoad ) {

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

	reset (): void {

		super.reset();

		this.tmpDurations.clear();

	}


}
