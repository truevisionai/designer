/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { Maths } from '../../../../utils/maths';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscEntityObject } from '../osc-entities';
import { OscActionType, OscDynamicsShape, OscTargetType } from '../osc-enums';
import { AbstractPrivateAction } from '../osc-interfaces';
import { AbstractTarget } from './abstract-target';
import { OscAbsoluteTarget } from './osc-absolute-target';
import { OscSpeedDynamics } from './osc-private-action';
import { OscRelativeTarget } from './osc-relative-target';

export class OscSpeedAction extends AbstractPrivateAction {

	actionType: OscActionType = OscActionType.Private_Longitudinal_Speed;
	public actionName: string = 'Speed';
	public dynamics: OscSpeedDynamics;
	private newSpeed: number;
	private currentSpeed: number;
	private startTime: number;

	constructor ( dynamics: OscSpeedDynamics = null, target: AbstractTarget = null ) {

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

	execute ( entity: OscEntityObject ) {

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

		this._target = new OscAbsoluteTarget( target );

	}

	private start ( entity: OscEntityObject ) {

		this.hasStarted = true;

		this.startTime = Time.time;

		this.currentSpeed = entity.speed;

		this.setNewSpeedTarget( entity );

		// TODO : Remove this switch case and keep only 1
		if ( this.dynamics.shape === OscDynamicsShape.step ) {

			entity.maxSpeed = this.newSpeed;

		}

	}

	private update ( entity: OscEntityObject ) {

		const timePassed = ( Time.time - this.startTime ) * 0.001;

		if ( timePassed <= this.dynamics.time ) {

			const fraction = timePassed / this.dynamics.time;

			switch ( this.dynamics.shape ) {

				case OscDynamicsShape.linear:
					entity.maxSpeed = Maths.linearInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case OscDynamicsShape.cubic:
					entity.maxSpeed = Maths.cubicInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case OscDynamicsShape.sinusoidal:
					entity.maxSpeed = Maths.sineInterpolation( this.currentSpeed, this.newSpeed, fraction );
					break;

				case OscDynamicsShape.step:
					entity.maxSpeed = this.newSpeed;
					break;

			}

		} else {

			this.isCompleted = true;

			this.completed.emit();

		}
	}


	private setNewSpeedTarget ( entity: OscEntityObject ) {

		switch ( this.target.targetType ) {

			case OscTargetType.absolute:

				this.newSpeed = this.target.value;

				break;

			case OscTargetType.relative:

				const name = ( this.target as OscRelativeTarget ).object;

				const obj = OscSourceFile.openScenario.findEntityOrFail( name );

				this.newSpeed = obj.speed + this.target.value;

				break;

		}
	}
}
