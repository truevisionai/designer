/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { Time } from '../../../../core/time';
import { TvLaneSide } from '../../../tv-map/models/tv-common';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { AbstractPrivateAction } from '../abstract-private-action';
import { EntityObject } from '../tv-entities';
import { ActionType, DynamicsShape, TargetType } from '../tv-enums';
import { AbstractTarget } from './abstract-target';
import { AbsoluteTarget } from './tv-absolute-target';
import { LaneChangeDynamics } from './tv-private-action';
import { RelativeTarget } from './tv-relative-target';

export class LaneChangeAction extends AbstractPrivateAction {

	public actionName = 'LaneChange';
	public actionType: ActionType = ActionType.Private_LaneChange;

	// public dynamics: LaneChangeDynamics = new LaneChangeDynamics();
	// public target: AbstractTarget = new AbsoluteTarget( 0 );
	// public targetLaneOffset?: number = null;

	// variables for action help
	private startTime = 0;
	// private currentLaneWidth = 0;
	private currentLaneId = 0;
	// private newLaneWidth = 0;
	private newLaneId = 0;
	// private tDirection = 0;

	// could be negative or positive
	private tDistance = 0;

	constructor (
		public dynamics?: LaneChangeDynamics,
		public target?: AbstractTarget,
		public targetLaneOffset?: number
	) {

		super();

		this.dynamics = dynamics || new LaneChangeDynamics();
		this.target = target || new AbsoluteTarget( 0 );

	}

	reset () {

		super.reset();

		// this.dynamics?.reset();
		this.target?.reset();

	}

	execute ( entity: EntityObject ) {

		if ( this.isCompleted ) return;

		if ( !this.hasStarted ) {

			this.start( entity );

		} else {

			const timePassed = ( Time.time - this.startTime ) * 0.001;

			if ( timePassed <= this.dynamics.time ) {

				this.performLaneChange( entity, timePassed );

			} else {

				this.isCompleted = true;

				this.completed.emit();

				entity.laneOffset = 0;
				entity.laneId = this.newLaneId;
			}

		}

	}

	start ( entity: EntityObject ) {

		const openDrive = TvMapInstance.map;
		const road = openDrive.getRoadById( entity.roadId );

		this.startTime = Time.time;

		this.hasStarted = true;

		this.currentLaneId = entity.laneId;

		switch ( this.target.targetType ) {

			case TargetType.absolute:
				this.newLaneId = this.currentLaneId + this.target.value;
				this.newLaneId = this.target.value;
				break;

			case TargetType.relative:
				const otherLaneId = ( this.target as RelativeTarget ).entity.laneId;
				this.newLaneId = otherLaneId + this.target.value;
				break;

		}

		// this.currentLaneWidth = road.getLaneWidth( entity.sCoordinate, this.currentLaneId );
		// this.newLaneWidth = road.getLaneWidth( entity.sCoordinate, this.newLaneId );

		const current = TvMapQueries.getLanePosition( road.id, this.currentLaneId, entity.sCoordinate, 0 );
		const desired = TvMapQueries.getLanePosition( road.id, this.newLaneId, entity.sCoordinate, 0 );
		const distance = current.distanceTo( desired );

		// if left lane change then negative
		// if right lane change then positive
		const side = this.currentLaneId > 0 ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

		let tDirection: number;

		if ( side == TvLaneSide.LEFT ) {

			tDirection = this.newLaneId > this.currentLaneId ? 1 : -1;

		} else if ( side == TvLaneSide.RIGHT ) {

			tDirection = this.newLaneId > this.currentLaneId ? -1 : 1;

		}


		// change from center of this lane to center of new lane
		// this.changeInTCoordinate = this.tDirection * ( this.currentLaneWidth + this.newLaneWidth ) * 0.5;
		this.tDistance = tDirection * distance;

	}

	private performLaneChange ( entity: EntityObject, timePassed: number ) {

		switch ( this.dynamics.shape ) {

			case DynamicsShape.linear:
				this.linearLaneChange( entity, timePassed, this.tDistance );
				break;

			case DynamicsShape.cubic:
				this.cubicLaneChange( entity, timePassed, this.tDistance );
				break;

			case DynamicsShape.sinusoidal:
				this.sinusoidalLaneChange( entity, timePassed, this.tDistance );
				break;

			case DynamicsShape.step:
				entity.laneId = timePassed >= this.dynamics.time ? this.newLaneId : this.currentLaneId;
				break;

		}
	}

	private linearLaneChange ( entity: EntityObject, timePassed: number, distance: number ) {

		const fraction = timePassed / this.dynamics.time;

		entity.laneOffset = MathUtils.lerp( 0, distance, fraction );

	}

	private sinusoidalLaneChange ( entity: EntityObject, timePassed: number, distance: number ) {

		const fraction = timePassed / this.dynamics.time;

		// Implementing a sine interpolation from 0 to 1 over the duration of the dynamics time
		entity.laneOffset = distance * Math.sin( Math.PI * fraction / 2 );

	}

	private cubicLaneChange ( entity: EntityObject, timePassed: number, distance: number ) {

		const fraction = timePassed / this.dynamics.time;

		// Implementing a cubic interpolation from 0 to 1 over the duration of the dynamics time
		entity.laneOffset = distance * ( Math.pow( fraction, 3 ) );

	}

}
