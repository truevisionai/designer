/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from '../position';
import { ConditionType, CoordinateSystem, RelativeDistanceType, RoutingAlgorithm, Rule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

export class TimeToCollisionCondition extends EntityCondition {

	public conditionType = ConditionType.ByEntity_TimeToCollision;
	public label: string = 'TimeToCollisionCondition';

	constructor (
		public target: string | Position,		// either entityRef or position
		public value: number,
		public freespace: boolean,
		public alongRoute: boolean,
		public rule: Rule,
		public coordinateSystem: CoordinateSystem = CoordinateSystem.entity,
		public relativeDistanceType: RelativeDistanceType = RelativeDistanceType.cartesianDistance,
		public routingAlgorithm: RoutingAlgorithm
	) {
		super();
	}

	hasPassed (): boolean {
		return false;
	}

}
