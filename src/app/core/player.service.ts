/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { Time } from './time';
import { ToolManager } from '../managers/tool-manager';

export interface PlayerUpdateData {
	time: number;
	delta: number;
}

@Injectable( {
	providedIn: 'root'
} )
export class PlayerService {

	playerStarted = new EventEmitter<any>();
	playerResumed = new EventEmitter<any>();
	playerTick = new EventEmitter<PlayerUpdateData>();
	playerPaused = new EventEmitter<any>();
	playerStopped = new EventEmitter<any>();
	public playing: boolean = false;
	private prevTime: number;
	private handle: number;
	private paused: boolean = false;

	constructor () {
	}

	play () {

		ToolManager.disable();

		this.prevTime = performance.now();

		if ( this.paused ) {

			this.playerResumed.emit();

		} else {

			this.playerStarted.emit();

		}

		this.playing = true;
		this.paused = false;

		const self = this;

		( function tick () {

			self.handle = requestAnimationFrame( tick );

			self.tick();

		}() );
	}

	pause () {

		this.playerPaused.emit();

		this.paused = true;
		this.playing = false;

		cancelAnimationFrame( this.handle );
	}

	stop () {

		cancelAnimationFrame( this.handle );

		this.playerStopped.emit();

		this.paused = false;
		this.playing = false;

		Time.reset();

		ToolManager.enable();
	}

	tick () {

		const time = performance.now();

		try {

			Time.deltaTime = Time.fixedDeltaTime / 1000;
			Time.deltaTimeInMs = Time.fixedDeltaTime;
			Time.time += Time.fixedDeltaTime;
			Time.frameCount++;
			Time.realTimeSinceStart = time;

			this.playerTick.emit( { time: time, delta: Time.fixedDeltaTime } );

		} catch ( e ) {

			console.error( ( e.message || e ), ( e.stack || '' ) );

		}

		this.prevTime = time;

	}
}
