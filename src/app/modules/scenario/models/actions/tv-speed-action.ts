/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { Maths } from '../../../../utils/maths';
import { PrivateAction } from '../private-action';
import { ScenarioEntity } from '../entities/scenario-entity';
import { ActionType } from '../tv-enums';
import { Target } from './target';
import { TransitionDynamics } from './transition-dynamics';
import { AbsoluteTarget } from './tv-absolute-target';
import { RelativeTarget } from './tv-relative-target';

/**
 * This action describes the transition of an entity's longitudinal
 * speed to a target longitudinal speed. SpeedActionDynamics
 * specifies the transition with respects to time or
 * distance combined with a shape.
 */
export class SpeedAction extends PrivateAction {

	public debug = false;

	public actionType: ActionType = ActionType.Private_Longitudinal_Speed;
	public label: string = 'Speed Action';

	private startTime: number;
	private initialSpeed: number;
	private targetSpeed: number;

	constructor ( public dynamics: TransitionDynamics = null, public target: Target = null ) {

		super();

	}

	execute ( entity: ScenarioEntity ) {

		if ( this.isCompleted ) return;

		if ( !this.startTime ) this.startTime = Time.time;

		if ( !this.initialSpeed ) this.initialSpeed = entity.getCurrentSpeed();

		if ( !this.targetSpeed ) {

			if ( this.target instanceof RelativeTarget ) {

				this.targetSpeed = this.target.value + this.initialSpeed;

			} else if ( this.target instanceof AbsoluteTarget ) {

				this.targetSpeed = this.target.value;

			}

		}

		const elapsedTime = ( Time.time - this.startTime ) * 0.001;

		let newSpeed = this.dynamics.calculateSpeed( this.initialSpeed, this.targetSpeed, elapsedTime );

		entity.setSpeed( newSpeed );

		if ( Maths.approxEquals( this.targetSpeed, entity.getCurrentSpeed() ) ) {

			this.actionCompleted();

		}

		if ( this.debug ) console.log( 'SpeedAction', entity.getCurrentSpeed(), this.targetSpeed, elapsedTime, this.dynamics );

	}

	reset () {

		super.reset();

		this.targetSpeed = null;
		this.initialSpeed = null;
		this.startTime = null;

	}

	// private start ( entity: EntityObject ) {
	//
	// 	this.hasStarted = true;
	//
	// 	this.startTime = Time.time;
	//
	// 	this.currentSpeed = entity.speed;
	//
	// 	this.setNewSpeedTarget( entity );
	//
	// 	// TODO : Remove this switch case and keep only 1
	// 	if ( this.dynamics.shape === DynamicsShape.step ) {
	//
	// 		entity.maxSpeed = this.newSpeed;
	//
	// 	}
	//
	// }

	// private update ( entity: EntityObject ) {

	// 	const timePassed = ( Time.time - this.startTime ) * 0.001;

	// 	if ( timePassed <= this.dynamics.time ) {

	// 		const fraction = timePassed / this.dynamics.time;

	// 		switch ( this.dynamics.shape ) {

	// 			case DynamicsShape.linear:
	// 				entity.maxSpeed = Maths.linearInterpolation( this.currentSpeed, this.newSpeed, fraction );
	// 				break;

	// 			case DynamicsShape.cubic:
	// 				entity.maxSpeed = Maths.cubicInterpolation( this.currentSpeed, this.newSpeed, fraction );
	// 				break;

	// 			case DynamicsShape.sinusoidal:
	// 				entity.maxSpeed = Maths.sineInterpolation( this.currentSpeed, this.newSpeed, fraction );
	// 				break;

	// 			case DynamicsShape.step:
	// 				entity.maxSpeed = this.newSpeed;
	// 				break;

	// 		}

	// 	} else {

	// 		this.isCompleted = true;

	// 		this.completed.emit();

	// 	}
	// }


	// private setNewSpeedTarget ( entity: EntityObject ) {
	//
	// 	switch ( this.target.targetType ) {
	//
	// 		case TargetType.absolute:
	//
	// 			this.newSpeed = this.target.value;
	//
	// 			break;
	//
	// 		case TargetType.relative:
	//
	// 			const name = ( this.target as RelativeTarget ).entityName;
	//
	// 			const obj = TvScenarioInstance.openScenario.findEntityOrFail( name );
	//
	// 			this.newSpeed = obj.speed + this.target.value;
	//
	// 			break;
	//
	// 	}
	// }
	//
	// getRate () {
	//
	// 	// return this.dynamics.rate;
	//
	// }
	//
	// setRate ( number: number ) {
	//
	// 	// this.dynamics.rate = number;
	//
	// }
}
