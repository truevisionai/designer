/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { Maths } from '../../../../utils/maths';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { EntityObject } from '../tv-entities';
import { ActionType, DynamicsShape, TargetType } from '../tv-enums';
import { AbstractPrivateAction } from '../tv-interfaces';
import { AbstractTarget } from './abstract-target';
import { AbsoluteTarget } from './tv-absolute-target';
import { SpeedDynamics } from './tv-private-action';
import { RelativeTarget } from './tv-relative-target';

export class SpeedAction extends AbstractPrivateAction {

	actionType: ActionType = ActionType.Private_Longitudinal_Speed;
	public actionName: string = 'Speed';
	public dynamics: SpeedDynamics;
	private newSpeed: number;
	private currentSpeed: number;
	private startTime: number;

	constructor ( dynamics: SpeedDynamics = null, target: AbstractTarget = null ) {

		super();

		this.dynamics = dynamics;
		this._target = target;

	}

	private _target: AbstractTarget;

	get target () {

		return this._target;

	}

	set target ( value ) {
		this._target = value;
	}

	execute ( entity: EntityObject ) {

		if ( !this.hasStarted ) {

			this.start( entity );
			this.update( entity );

		} else {

			this.update( entity );

		}

	}

	setTarget ( target: AbstractTarget ) {

		this._target = target;

	}

	setAbsoluteTarget ( target: number ) {

		this._target = new AbsoluteTarget( target );

	}

	private start ( entity: EntityObject ) {

		this.hasStarted = true;

		this.startTime = Time.time;

		this.currentSpeed = entity.speed;

		this.setNewSpeedTarget( entity );

		// TODO : Remove this switch case and keep only 1
		if ( this.dynamics.shape === DynamicsShape.step ) {

			entity.maxSpeed = this.newSpeed;

		}

	}

	private update ( entity: EntityObject ) {

		const timePassed = ( Time.time - this.startTime ) * 0.001;

		if ( timePassed <= this.dynamics.time ) {

			const fraction = timePassed / this.dynamics.time;

			switch ( this.dynamics.shape ) {

				case DynamicsShape.linear:
					entity.maxSpeed = Maths.linearInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case DynamicsShape.cubic:
					entity.maxSpeed = Maths.cubicInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case DynamicsShape.sinusoidal:
					entity.maxSpeed = Maths.sineInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case DynamicsShape.step:
					entity.maxSpeed = this.newSpeed;
					break;

			}

		} else {

			this.isCompleted = true;

			this.completed.emit();

		}
	}


	private setNewSpeedTarget ( entity: EntityObject ) {

		switch ( this.target.targetType ) {

			case TargetType.absolute:

				this.newSpeed = this.target.value;

				break;

			case TargetType.relative:

				const name = ( this.target as RelativeTarget ).entityName;

				const obj = TvScenarioInstance.openScenario.findEntityOrFail( name );

				this.newSpeed = obj.speed + this.target.value;

				break;

		}
	}

	getRate () {

		return this.dynamics.rate;

	}

	setRate ( number: number ) {

		this.dynamics.rate = number;

	}
}
