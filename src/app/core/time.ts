/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class Time {

	/**
	 * Time passed in simulation in milliseconds or ms
	 */
	static time: number = 0;

	/**
	 * Fixed time-step for physics/simulation update
	 * in millisecond
	 * 20ms = 50 updates per second
	 */
	static fixedDeltaTime: number = 20;

	/**
	 * Time since last graphic update
	 */
	static deltaTime: number = 0;

	/**
	 * Time since last graphic update in ms
	 */
	static deltaTimeInMs: number = 0;

	/**
	 * Graphics frames count
	 */
	static frameCount: number = 0;

	static realTimeSinceStart: number = 0;

	/**
	 * Returns rounded second
	 */
	static get seconds () {

		return ( Time.time * 0.001 ).toFixed( 2 );

	}

	/**
	 * Returns time in seconds without rounding
	 */
	static get inSeconds () {

		return Time.time * 0.001;

	}

	static reset () {

		this.deltaTime = 0;
		this.deltaTimeInMs = 0;
		this.time = 0;
		this.frameCount = 0;
		this.realTimeSinceStart = 0;

	}
}
