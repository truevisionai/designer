import { TvConsole } from 'app/core/utils/console';
import { EnumHelper } from '../../../tv-map/models/tv-common';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { DynamicsDimension, DynamicsShape } from '../tv-enums';

export class TransitionDynamics {

	constructor (
		public dynamicsShape: DynamicsShape = DynamicsShape.step,
		public value: number = 0,
		public dynamicsDimension: DynamicsDimension = DynamicsDimension.time
	) {

	}

	calculateSpeed ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		let newSpeed = initialSpeed;

		// let speedChange = targetSpeed - initialSpeed;  // calculate the required change in speed

		switch ( this.dynamicsShape ) {

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

		if ( this.dynamicsDimension === DynamicsDimension.time ) {

			return elapsedTime >= this.value ? targetSpeed : initialSpeed;

		} else if ( this.dynamicsDimension === DynamicsDimension.rate ) {

			return elapsedTime * this.value >= 1 ? targetSpeed : initialSpeed;

		} else if ( this.dynamicsDimension === DynamicsDimension.distance ) {

			return elapsedTime * initialSpeed >= this.value ? targetSpeed : initialSpeed;
		}

	}

	private linearCalculation ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		if ( this.dynamicsDimension === DynamicsDimension.time ) {

			return initialSpeed + ( targetSpeed - initialSpeed ) * elapsedTime / this.value;

		} else if ( this.dynamicsDimension === DynamicsDimension.rate ) {

			return initialSpeed + ( targetSpeed - initialSpeed ) * this.value * elapsedTime;

		} else if ( this.dynamicsDimension === DynamicsDimension.distance ) {

			// You might want to consider time and distance to calculate new speed
			// For instance, if you have the total time and distance for the simulation
			// newSpeed = distance / total_time;
			throw new Error( 'not implemented' );

		}

	}

	private sinusoidalCalculation ( initialSpeed: number, targetSpeed: number, elapsedTime: number ) {

		if ( this.dynamicsDimension === DynamicsDimension.time ) {

			let phase = Math.PI * elapsedTime / this.value;

			return initialSpeed + ( targetSpeed - initialSpeed ) * ( 1 - Math.cos( phase ) ) / 2;

		} else if ( this.dynamicsDimension === DynamicsDimension.rate ) {

			let phase = Math.PI * this.value * elapsedTime;

			return initialSpeed + ( targetSpeed - initialSpeed ) * ( 1 - Math.cos( phase ) ) / 2;

		} else if ( this.dynamicsDimension === DynamicsDimension.distance ) {

			// This case needs to be defined based on how distance should affect speed.
			throw new Error( 'not implemented' );
		}
	}

	calculateOffset ( initialOffset: number, targetOffset: number, elapsedTime: number ) {

		let newLaneOffset = initialOffset;

		switch ( this.dynamicsShape ) {

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

	getDimensionAsString () {

		switch ( this.dynamicsDimension ) {

			case DynamicsDimension.distance:
				return 'distance';

			case DynamicsDimension.time:
				return 'time';

			case DynamicsDimension.rate:
				return 'rate';

			default:
				TvConsole.warn( 'unknown dynamics dimension' + this.dynamicsDimension );
				return 'value';

		}

	}

	getDimensionSuffix () {

		switch ( this.dynamicsDimension ) {

			case DynamicsDimension.distance:
				return 'm';

			case DynamicsDimension.time:
				return 's';

			case DynamicsDimension.rate:
				return 'm/s';

			default:
				TvConsole.warn( 'unknown dynamics dimension' + this.dynamicsDimension );
				return '';

		}

	}

	static fromXML ( xml: XmlElement ): TransitionDynamics {

		const shape = EnumHelper.stringToDynamics( xml.attr_shape ?? 'step' );

		const dimensionValue = parseFloat( xml.attr_rate ?? 0 );

		const dimension = EnumHelper.stringToDimension( xml.attr_dimension ?? 'time' );

		return new TransitionDynamics( shape, dimensionValue, dimension );

	}
}
