/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { TvLaneSide } from '../../../tv-map/models/tv-common';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { AbstractPrivateAction } from '../abstract-private-action';
import { EntityObject } from '../tv-entities';
import { ActionType } from '../tv-enums';
import { AbstractTarget } from './abstract-target';
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
export class LaneChangeAction extends AbstractPrivateAction {

	public actionName = 'LaneChange';
	public actionType: ActionType = ActionType.Private_LaneChange;

	private startTime = 0;
	private targetLaneId = 0;
	private lateralDistance = 0;	// could be negative or positive
	private initialLaneOffset: number;

	private debug = true;

	constructor (
		public dynamics: TransitionDynamics = new TransitionDynamics(),
		public target: AbstractTarget = new AbsoluteTarget( 0 ),
		public targetLaneOffset: number = 0
	) {

		super();

	}

	reset () {

		super.reset();

		this.target?.reset();

		this.startTime = null;
		this.targetLaneId = null;
		this.lateralDistance = null
		this.initialLaneOffset = null;


	}

	execute ( entity: EntityObject ) {

		if ( this.isCompleted ) return;

		if ( !this.startTime ) {

			this.startTime = Time.time;

			this.computeLateralDistance( entity );

		}

		const elapsedTime = ( Time.time - this.startTime ) * 0.001;

		const newLaneOffset = this.dynamics.calculateOffset( this.initialLaneOffset, this.lateralDistance, elapsedTime );

		// TODO: need to double check this
		if ( Math.abs( entity.getCurrentLaneOffset() ) >= Math.abs( this.lateralDistance ) ) {

			this.actionCompleted();

			// entity.laneId = this.targetLaneId;

		}

		entity.setLaneOffset( newLaneOffset );

		if ( this.debug ) {

			console.log( 'LaneChangeAction', entity.laneId, this.lateralDistance, entity.getCurrentLaneOffset(), newLaneOffset, elapsedTime );

		}

	}

	private computeLateralDistance ( entity: EntityObject ) {

		this.initialLaneOffset = entity.getCurrentLaneOffset();

		// if left lane change then negative
		// if right lane change then positive
		const side = entity.getCurrentLaneId() > 0 ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

		let tDirection: number;

		if ( side == TvLaneSide.LEFT ) {

			tDirection = this.target.value > 0 ? 1 : -1;

		} else if ( side == TvLaneSide.RIGHT ) {

			tDirection = this.target.value > 0 ? -1 : 1;

		}

		if ( this.target instanceof RelativeTarget ) {

			this.targetLaneId = this.target.entity.laneId + ( this.target.value * tDirection );

		} else {

			this.targetLaneId = this.target.value;

		}

		const road = TvMapInstance.map.getRoadById( entity.roadId );

		const current = TvMapQueries.getLanePosition( road.id, entity.getCurrentLaneId(), entity.sCoordinate, this.initialLaneOffset );
		const desired = TvMapQueries.getLanePosition( road.id, this.targetLaneId, entity.sCoordinate, this.targetLaneOffset );
		const distance = current.distanceTo( desired );

		// change from center of this lane to center of new lane
		this.lateralDistance = tDirection * distance * -1;
	}
}
