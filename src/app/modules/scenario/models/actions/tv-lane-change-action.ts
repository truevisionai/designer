/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { Time } from '../../../../core/time';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { ScenarioEntity } from '../entities/scenario-entity';
import { PrivateAction } from '../private-action';
import { ActionType } from '../tv-enums';
import { Target } from './target';
import { TransitionDynamics } from './transition-dynamics';
import { AbsoluteTarget } from './tv-absolute-target';
import { RelativeTarget } from './tv-relative-target';

/**
 * This action describes the transition between an entity's
 * current lane and its target lane. The target lane may be
 * given in absolute or relative terms. The dynamics of the
 * transition may be given either by providing the time or
 * the distance required for performing the transition. Time
 * and distance are measured between the start position and
 * the end position of the action.. The transition starts at
 * the current lane position, including the current lane
 * offset and ends at the target lane position, optionally
 * including a targetLaneOffset.
 */
export class LaneChangeAction extends PrivateAction {

	public label = 'LaneChange';
	public actionType: ActionType = ActionType.Private_LaneChange;

	private startTime = 0;
	private targetLaneId = 0;
	private lateralDistance = 0;	// could be negative or positive
	private initialLaneOffset: number;

	private debug = false;

	constructor (
		public dynamics: TransitionDynamics = new TransitionDynamics(),
		public target: Target = new AbsoluteTarget( 0 ),
		public targetLaneOffset: number = 0
	) {

		super();

	}

	setTarget ( target: Target ) {

		this.target = target;

	}

	reset () {

		super.reset();

		this.startTime = null;
		this.targetLaneId = null;
		this.lateralDistance = null;
		this.initialLaneOffset = null;

	}

	execute ( entity: ScenarioEntity ) {

		if ( this.isCompleted ) return;

		if ( !this.startTime ) {

			this.startTime = Time.time;

			this.computeLateralDistance( entity );

		}

		const elapsedTime = ( Time.time - this.startTime ) * 0.001;

		const newLaneOffset = this.dynamics.calculateOffset( this.initialLaneOffset, this.lateralDistance, elapsedTime );

		// TODO: need to double check this
		if ( Maths.approxEquals( Math.abs( entity.getCurrentLaneOffset() ), Math.abs( this.lateralDistance ) ) ) {

			entity.setLaneOffset( 0 );

			entity.setLaneId( this.targetLaneId );

			this.actionCompleted();

		} else {

			entity.setLaneOffset( newLaneOffset );

		}

		if ( this.debug ) {

			console.log( 'LaneChangeAction', entity.getCurrentLaneId(), this.lateralDistance, entity.getCurrentLaneOffset(), newLaneOffset, elapsedTime );

		}

	}

	private computeLateralDistance ( entity: ScenarioEntity ) {

		this.initialLaneOffset = entity.getCurrentLaneOffset();

		// Determine the side of the lane the entity is currently in
		const isEntityOnLeftSide = entity.getCurrentLaneId() > 0;

		// Placeholder for target lane ID and lane change direction
		let offsetDirection: number;

		// Compute the target lane ID based on whether the target is relative or not
		if ( this.target instanceof RelativeTarget ) {
			this.targetLaneId = this.target.entityRef.entity.getCurrentLaneId() + ( isEntityOnLeftSide ? this.target.value : -this.target.value );
		} else {
			this.targetLaneId = this.target.value;
		}

		// Determine the lane change direction based on the side of the road
		offsetDirection = Math.sign( this.targetLaneId - entity.getCurrentLaneId() ) * ( isEntityOnLeftSide ? 1 : -1 );

		const road = TvMapInstance.map.getRoadById( entity.getCurrentRoadId() );

		const current = TvMapQueries.getLaneCenterPosition( road.id, entity.getCurrentLaneId(), entity.getS(), this.initialLaneOffset );
		const desired = TvMapQueries.getLaneCenterPosition( road.id, this.targetLaneId, entity.getS(), this.targetLaneOffset );
		const distance = current.distanceTo( desired );

		// change from center of this lane to center of new lane
		this.lateralDistance = offsetDirection * distance;
	}

	private computeTDirection () {

		// // if left lane change then negative
		// // if right lane change then positive
		// const side = entity.getCurrentLaneId() > 0 ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

		// let tDirection;

		// if ( this.target instanceof RelativeTarget ) {

		// 	if ( side === TvLaneSide.RIGHT ) {

		// 		this.targetLaneId = this.target.entity.laneId - this.target.value;

		// 		tDirection = Math.sign( this.targetLaneId - entity.laneId ) * -1;


		// 	} else {

		// 		this.targetLaneId = this.target.entity.laneId + this.target.value;

		// 		tDirection = Math.sign( this.targetLaneId - entity.laneId );

		// 	}

		// } else {

		// 	this.targetLaneId = this.target.value;

		// 	if ( side === TvLaneSide.RIGHT ) {

		// 		tDirection = Math.sign( this.targetLaneId - entity.laneId ) * -1;

		// 	} else {

		// 		tDirection = Math.sign( this.targetLaneId - entity.laneId );


		// 	}

		// }

	}
}
