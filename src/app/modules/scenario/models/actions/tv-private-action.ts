/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractAction } from '../abstract-action';
import { AbstractPrivateAction } from '../abstract-private-action';
import { ActionCategory, DynamicsShape } from '../tv-enums';

export class DontUse_PrivateAction extends AbstractPrivateAction {
	actionType: import( '../tv-enums' ).ActionType;

	public category = ActionCategory.private;

	public actionName: string = '';

	private Actions: AbstractAction[] = [];

	get actions () {

		return this.Actions;

	}

	exportXml () {

		return {};

	}

}


export class LaneChangeDynamics {


	constructor (
		public time?: number,
		public distance?: number,
		public shape?: DynamicsShape,
		public rate?: number,
	) {
	}

}

export class SpeedDynamics {

	constructor (
		public shape: DynamicsShape = DynamicsShape.step,
		public dimensionValue: number = 0,
		public dimension: DynamicsDimension = DynamicsDimension.time
	) {

	}

	calculateSpeed ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		let newSpeed = initialSpeed;

		let speedChange = targetSpeed - initialSpeed;  // calculate the required change in speed

		switch ( this.shape ) {

			case DynamicsShape.step:
				newSpeed = this.stepCalculation( initialSpeed, targetSpeed, elapsedTime );
				break;

			case DynamicsShape.linear:
				newSpeed = this.linearCalculation( initialSpeed, targetSpeed, elapsedTime );
				break;

			case DynamicsShape.sinusoidal:
				newSpeed = this.sinusoidalCalculation( initialSpeed, targetSpeed, elapsedTime );
				break;

			case DynamicsShape.cubic:
				// For cubic dynamics, we would need a function to calculate cubic speed
				throw new Error( 'not implemented' );
				break;
		}

		return newSpeed;
	}

	private stepCalculation ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		if ( this.dimension === DynamicsDimension.time ) {

			return elapsedTime >= this.dimensionValue ? targetSpeed : initialSpeed;

		} else if ( this.dimension === DynamicsDimension.rate ) {

			return elapsedTime * this.dimensionValue >= 1 ? targetSpeed : initialSpeed;

		} else if ( this.dimension === DynamicsDimension.distance ) {

			return elapsedTime * initialSpeed >= this.dimensionValue ? targetSpeed : initialSpeed;
		}

	}

	private linearCalculation ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		if ( this.dimension === DynamicsDimension.time ) {

			return initialSpeed + ( targetSpeed - initialSpeed ) * elapsedTime / this.dimensionValue;

		} else if ( this.dimension === DynamicsDimension.rate ) {

			return initialSpeed + ( targetSpeed - initialSpeed ) * this.dimensionValue * elapsedTime;

		} else if ( this.dimension === DynamicsDimension.distance ) {

			// You might want to consider time and distance to calculate new speed
			// For instance, if you have the total time and distance for the simulation
			// newSpeed = distance / total_time;
			throw new Error( 'not implemented' );

		}

	}

	private sinusoidalCalculation ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		if ( this.dimension === DynamicsDimension.time ) {

			let phase = Math.PI * elapsedTime / this.dimensionValue;

			return initialSpeed + ( targetSpeed - initialSpeed ) * ( 1 - Math.cos( phase ) ) / 2;

		} else if ( this.dimension === DynamicsDimension.rate ) {

			let phase = Math.PI * this.dimensionValue * elapsedTime;

			return initialSpeed + ( targetSpeed - initialSpeed ) * ( 1 - Math.cos( phase ) ) / 2;

		} else if ( this.dimension === DynamicsDimension.distance ) {

			// This case needs to be defined based on how distance should affect speed.
			throw new Error( 'not implemented' );
		}
	}
}

export enum DynamicsDimension {
	time,	// time
	distance, // distance
	rate	// rate of change
}

export class SpeedDynamicsV2 {

	constructor (
		public shape: DynamicsShape = DynamicsShape.linear,
		public value: number = 0,
		public dimension: DynamicsDimension = DynamicsDimension.time
	) {

	}

	calculateSpeed ( currentSpeed: number, elapsedTime: number ) {

		let newSpeed = currentSpeed;

		switch ( this.shape ) {

			case DynamicsShape.step:
				newSpeed = this.value;
				break;

			case DynamicsShape.linear:

				if ( this.dimension === DynamicsDimension.time ) {

					newSpeed = currentSpeed + ( this.value * elapsedTime );

				} else if ( this.dimension === DynamicsDimension.rate ) {

					newSpeed = currentSpeed + ( this.value / elapsedTime );

				} else if ( this.dimension === DynamicsDimension.distance ) {

					// You might want to consider time and distance to calculate new speed
					// For instance, if you have the total time and distance for the simulation
					// newSpeed = distance / total_time;
					throw new Error( 'not implemented' );

				}
				break;

			case DynamicsShape.sinusoidal:
				if ( this.dimension === DynamicsDimension.time ) {
					// Here, this.value is the total time for the speed change.
					// The elapsed time is divided by the total time to get a value from 0 to 1,
					// which is then multiplied by pi to get a value from 0 to pi,
					// corresponding to a half period of the sine wave.
					newSpeed = currentSpeed + this.value * Math.sin( Math.PI * elapsedTime / this.value );
				} else if ( this.dimension === DynamicsDimension.rate ) {
					// Here, this.value is the rate of speed change, so we multiply it by the sine of the elapsed time.
					// The rate is assumed to be in units of speed/time, so multiplying by time gives a speed.
					newSpeed = currentSpeed + this.value * Math.sin( Math.PI * elapsedTime );
				} else if ( this.dimension === DynamicsDimension.distance ) {
					// This case would need to be defined based on how you want distance to affect speed.
					throw new Error( 'not implemented' );
				}
				break;

			case DynamicsShape.cubic:
				// For cubic dynamics, we would need a function to calculate cubic speed
				throw new Error( 'not implemented' );
				break;
		}

		return newSpeed;
	}

}

