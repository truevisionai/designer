/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionCategory, ConditionEdge, ConditionType, Rule } from '../tv-enums';
import { TvScenario } from "../tv-scenario";

export function conditionTypeToString ( type: ConditionType ): string {

	if ( type == ConditionType.ByEntity_EndOfRoad ) return 'EndOfRoadCondition';

	if ( type == ConditionType.ByEntity_Collision ) return 'CollisionCondition';

	if ( type == ConditionType.ByEntity_Offroad ) return 'OffroadCondition';

	if ( type == ConditionType.ByEntity_TimeHeadway ) return 'TimeHeadwayCondition';

	if ( type == ConditionType.ByEntity_TimeToCollision ) return 'TimeToCollisionCondition';

	if ( type == ConditionType.ByEntity_Acceleration ) return 'AccelerationCondition';

	if ( type == ConditionType.ByEntity_StandStill ) return 'StandStillCondition';

	if ( type == ConditionType.ByEntity_Speed ) return 'SpeedCondition';

	if ( type == ConditionType.ByEntity_RelativeSpeed ) return 'RelativeSpeedCondition';

	if ( type == ConditionType.ByEntity_TraveledDistance ) return 'TraveledDistanceCondition';

	if ( type == ConditionType.ByEntity_ReachPosition ) return 'ReachPositionCondition';

	if ( type == ConditionType.ByEntity_Distance ) return 'DistanceCondition';

	if ( type == ConditionType.ByEntity_RelativeDistance ) return 'RelativeDistanceCondition';

	if ( type == ConditionType.ByState_AfterTermination ) return 'AfterTerminationCondition';

	if ( type == ConditionType.ByState_AtStart ) return 'AtStartCondition';

	if ( type == ConditionType.ByState_Command ) return 'CommandCondition';

	if ( type == ConditionType.ByState_Signal ) return 'SignalCondition';

	if ( type == ConditionType.ByState_Controller ) return 'ControllerCondition';

	if ( type == ConditionType.ByValue_Parameter ) return 'ParameterCondition';

	if ( type == ConditionType.TimeOfDay ) return 'TimeOfDayCondition';

	if ( type == ConditionType.ByValue_SimulationTime ) return 'SimulationTimeCondition';

	if ( type == ConditionType.Parameter ) return 'ParameterCondition';

	if ( type == ConditionType.StoryboardElementState ) return 'StoryboardElementStateCondition';

	if ( type == ConditionType.UserDefinedValue ) return 'UserDefinedValueCondition';

	if ( type == ConditionType.TrafficSignal ) return 'TrafficSignalCondition';

	if ( type == ConditionType.TrafficSignalController ) return 'TrafficSignalControllerCondition';

}

export abstract class Condition {

	public abstract category: ConditionCategory;

	public abstract conditionType: ConditionType;

	public abstract label: string;

	public delay: number = 0;

	public edge: ConditionEdge = ConditionEdge.risingOrFalling;

	public passed: boolean;

	public scenario: TvScenario;

	constructor () {
	}

	get conditionTypeString () {
		return conditionTypeToString( this.conditionType );
	}

	abstract hasPassed (): boolean;

	hasRulePassed ( rule: Rule, left: number, right: number ): boolean {

		return ConditionUtils.hasRulePassed( rule, left, right );

	}

	reset (): void {
		this.passed = false;
		this.scenario = null;
	}
}

