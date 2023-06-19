/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * The current relative speed of a triggering entity/entities to a reference
 * entity is compared to a given value. The logical operator
 * used for the evaluation is defined by the rule attribute.
 */
export class RelativeSpeedCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_RelativeSpeed;
	public name: string = 'RelativeSpeedCondition';

	constructor ( public entity: string, public speed: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			const targetEntity = this.getEntity( this.entity );

			for ( const entityName of this.triggeringEntities ) {

				const triggerEntity = this.getEntity( entityName );

				const relativeSpeed = triggerEntity.getCurrentSpeed() - targetEntity.getCurrentSpeed();

				const passed = ConditionUtils.hasRulePassed( this.rule, relativeSpeed, this.speed );

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
