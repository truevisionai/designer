/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../core/time';

export class DynamicConstraints {

	/**
	 *
	 * @param maxAcceleration Maximum acceleration the distance controller is allowed to
	 * 						  use for keeping the distance. Unit: m/s2; Range: [0..inf[.
	 * @param maxDeceleration Maximum deceleration the distance controller is allowed to
	 * 						  use for keeping the distance. Unit: m/s2; Range: [0..inf[.
	 * @param maxSpeed		  Maximum speed the distance controller is allowed to use
	 * 						  for keeping the distance. Unit: m/s; Range: [0..inf[.
	 */
	constructor (
		public maxAcceleration: number = 10.0,
		public maxDeceleration: number = 10.0,
		public maxSpeed: number = 40.0
	) {

		/**
		 * maxAcceleration: Common values for maximum acceleration for passenger
		 * vehicles vary greatly depending on the vehicle's power and weight,
		 * among other factors. A small car might have a maximum acceleration
		 * of around 3 m/s², a sporty car could have around 6 m/s², and a
		 * high-performance sports car could have 10 m/s² or more.
		 */

		/**
		 * maxDeceleration: The maximum deceleration is typically higher than the
		 * maximum acceleration, as vehicles can usually brake harder than they
		 * can accelerate. A typical passenger car might be able to decelerate
		 * at 7-8 m/s² under hard braking. Note that this is less than the
		 * acceleration due to gravity (approximately 9.8 m/s²), as any higher
		 * would cause the tires to lose traction and skid.
		 */

		/**
		 * maxSpeed: This also varies significantly depending on the vehicle.
		 * For a small economy car, the maximum speed might be around
		 * 30-40 m/s (approximately 110-145 km/h). A high-performance sports
		 * car might have a maximum speed of over 80 m/s (approximately 290 km/h).
		 */

	}

	// proportional controller, which is a type of feedback
	// controller that adjusts its output proportional to the error.
	computeSpeed ( currentDistance: any, targetDistance: any, currentSpeed: any, targetEntitySpeed: any ): any {

		const distanceDiff = currentDistance - targetDistance;
		const speedDiff = currentSpeed - targetEntitySpeed;

		// displacement TODO:

		const tension = distanceDiff < 0.0 ? this.maxAcceleration : this.maxDeceleration;

		const springForce = tension * 0.5;
		const dc = 2 * Math.sqrt( springForce );
		const acc = distanceDiff * springForce - speedDiff * dc;

		// TODO min,max for accelration and deceleration

		// calculate the new speed, making sure not to exceed the max speed
		let newSpeed = currentSpeed + ( acc * Time.fixedDeltaTime * 0.001 ); // convert to seconds

		newSpeed = Math.min( newSpeed, this.maxSpeed );
		newSpeed = Math.max( newSpeed, 0 );  // don't allow negative speed

		return newSpeed;

	}
}
