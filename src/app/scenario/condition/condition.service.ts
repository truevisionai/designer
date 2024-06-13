/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Condition } from "../models/conditions/tv-condition";
import { ConditionType, Rule, TriggeringRule } from "../models/tv-enums";
import { SimulationTimeCondition } from "../models/conditions/tv-simulation-time-condition";
import { Time } from "../../core/time";
import { ConditionUtils } from "../builders/condition-utils";
import { SpeedCondition } from "../models/conditions/tv-speed-condition";
import { EntityService } from "../entity/entity.service";
import { EndOfRoadCondition } from "../models/conditions/tv-end-of-road-condition";
import { OffRoadCondition } from "../models/conditions/tv-off-road-condition";

@Injectable( {
	providedIn: 'root'
} )
export class ConditionService {

	constructor (
		private entityService: EntityService
	) {
	}

	hasConditionPassed ( condition: Condition ): boolean {

		switch ( condition.conditionType ) {
			case ConditionType.ByEntity_EndOfRoad:
				return this.hasEndOfRoadConditionPassed( condition as EndOfRoadCondition );
				break;
			case ConditionType.ByEntity_Collision:
				break;
			case ConditionType.ByEntity_Offroad:
				return this.hasEntityOffRoadConditionPassed( condition as OffRoadCondition );
				break;
			case ConditionType.ByEntity_TimeHeadway:
				break;
			case ConditionType.ByEntity_TimeToCollision:
				break;
			case ConditionType.ByEntity_Acceleration:
				break;
			case ConditionType.ByEntity_StandStill:
				break;
			case ConditionType.ByEntity_Speed:
				return this.hasSpeedConditionPassed( condition as SpeedCondition );
				break;
			case ConditionType.ByEntity_RelativeSpeed:
				break;
			case ConditionType.ByEntity_TraveledDistance:
				break;
			case ConditionType.ByEntity_ReachPosition:
				break;
			case ConditionType.ByEntity_Distance:
				break;
			case ConditionType.ByEntity_RelativeDistance:
				break;
			case ConditionType.ByState_AfterTermination:
				break;
			case ConditionType.ByState_AtStart:
				break;
			case ConditionType.ByState_Command:
				break;
			case ConditionType.ByState_Signal:
				break;
			case ConditionType.ByState_Controller:
				break;
			case ConditionType.ByValue_Parameter:
				break;
			case ConditionType.TimeOfDay:
				break;
			case ConditionType.ByValue_SimulationTime:
				return this.hasSimulationTimeConditionPassed( condition as SimulationTimeCondition );
				break;
			case ConditionType.Parameter:
				break;
			case ConditionType.StoryboardElementState:
				break;
			case ConditionType.UserDefinedValue:
				break;
			case ConditionType.TrafficSignal:
				break;
			case ConditionType.TrafficSignalController:
				break;

		}

	}

	private hasSimulationTimeConditionPassed ( condition: SimulationTimeCondition ) {

		return this.hasRulePassed( condition.rule, Time.inSeconds, condition.value );

	}

	private hasSpeedConditionPassed ( condition: SpeedCondition ) {

		for ( const entityName of condition.triggeringEntities ) {

			const entity = this.entityService.findEntityByName( entityName );

			const currentSpeed = entity.getCurrentSpeed();

			const passed = this.hasRulePassed( condition.rule, currentSpeed, condition.value );

			// exit if any of the entity distance is passed
			if ( passed && condition.triggeringRule === TriggeringRule.Any ) {

				return true;

			}

			// exit if any of the entity distance is not passed
			if ( !passed && condition.triggeringRule === TriggeringRule.All ) {

				return false;

			}

		}

		return false;

	}

	private hasRulePassed ( rule: Rule, left: number, right: number ) {

		return ConditionUtils.hasRulePassed( rule, left, right );

	}

	private hasEndOfRoadConditionPassed ( condition: EndOfRoadCondition ) {

		const passed: boolean[] = condition.triggeringEntities.map( entityName => {

			const isEndOfRoad = this.entityService.findEntityByName( entityName ).isAtEndOfRoad();

			if ( isEndOfRoad ) {

				if ( !condition.tmpDurations.has( entityName ) ) {

					condition.tmpDurations.set( entityName, 0 );

				}

				const newDuration = condition.tmpDurations.get( entityName ) + Time.fixedDeltaTime * 0.001;

				condition.tmpDurations.set( entityName, newDuration );

			} else {

				condition.tmpDurations.set( entityName, 0 );

			}

			return condition.tmpDurations.get( entityName ) >= condition.duration;

		} );

		if ( condition.triggeringRule === TriggeringRule.Any ) {

			return passed.some( p => p );

		} else if ( condition.triggeringRule === TriggeringRule.All ) {

			return passed.every( p => p );

		} else {

			return false;

		}

	}

	private hasEntityOffRoadConditionPassed ( condition: OffRoadCondition ) {

		const isOffRoad = ( entityName: string ) => {

			const entity = this.entityService.findEntityByName( entityName );

			const isOffRoad = entity.isOffRoad();

			if ( isOffRoad ) {

				if ( !condition.tmpDurations.has( entityName ) ) {

					condition.tmpDurations.set( entityName, 0 );

				}

				const newDuration = condition.tmpDurations.get( entityName ) + Time.fixedDeltaTime * 0.001;

				condition.tmpDurations.set( entityName, newDuration );

			} else {

				condition.tmpDurations.set( entityName, 0 );

			}

			return condition.tmpDurations.get( entityName ) >= condition.duration;

		}

		const passed: boolean[] = condition.triggeringEntities.map( isOffRoad );

		if ( condition.triggeringRule === TriggeringRule.Any ) {

			return passed.some( p => p );

		} else if ( condition.triggeringRule === TriggeringRule.All ) {

			return passed.every( p => p );

		} else {

			return false;

		}

	}
}
