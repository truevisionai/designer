import { DynamicsDimension, DynamicsShape } from '../tv-enums';

export class TransitionDynamics {

	constructor (
		public shape: DynamicsShape = DynamicsShape.step,
		public dimensionValue: number = 0,
		public dimension: DynamicsDimension = DynamicsDimension.time
	) {

	}

	calculateSpeed ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		let newSpeed = initialSpeed;

		// let speedChange = targetSpeed - initialSpeed;  // calculate the required change in speed

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

	calculateOffset ( initialOffset: number, targetOffset: number, elapsedTime: number ) {

		let newLaneOffset = initialOffset;

		switch ( this.shape ) {

			case DynamicsShape.step:
				newLaneOffset = this.stepCalculation( initialOffset, targetOffset, elapsedTime );
				break;

			case DynamicsShape.linear:
				newLaneOffset = this.linearCalculation( initialOffset, targetOffset, elapsedTime );
				break;

			case DynamicsShape.sinusoidal:
				newLaneOffset = this.sinusoidalCalculation( initialOffset, targetOffset, elapsedTime );
				break;

			case DynamicsShape.cubic:
				// For cubic dynamics, we would need a function to calculate cubic speed
				throw new Error( 'not implemented' );
				break;
		}

		return newLaneOffset;

	}
}
