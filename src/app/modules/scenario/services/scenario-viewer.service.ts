/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Quaternion, Vector3 } from 'three';
import { PlayerService, PlayerUpdateData } from '../../../core/player.service';
import { TvConsole } from '../../../core/utils/console';
import { ThreeService } from '../../three-js/three.service';
import { ScenarioInstance } from './scenario-instance';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioViewerService {

	private originalPosition = new Vector3();
	private originalQuaternion = new Quaternion();

	constructor (
		private player: PlayerService,
		private threeService: ThreeService
	) {

		player.playerStarted.subscribe( e => this.onPlayerStarted() );
		player.playerResumed.subscribe( e => this.onPlayerResumed() );
		player.playerStopped.subscribe( e => this.onPlayerStopped() );
		player.playerPaused.subscribe( e => this.onPlayerPaused() );
		player.playerTick.subscribe( e => this.onPlayerTick( e ) );

	}

	setFocus () {

		const entities = [ ...ScenarioInstance.scenario.objects.values() ];

		if ( entities.length === 0 ) {

			TvConsole.warn( 'No Entity to focus' );

			return;
		}

		const entity = [ ...ScenarioInstance.scenario.objects.values() ][ 0 ];

		// Store original position and orientation
		this.originalPosition.copy( this.threeService.camera.position );
		this.originalQuaternion.copy( this.threeService.camera.quaternion );

		this.threeService.setFocusTarget( entity );

	}

	private onPlayerStarted () {

		this.setFocus();

	}

	private onPlayerResumed () {

	}

	private onPlayerStopped () {

		this.removeFocus();

	}

	private onPlayerPaused () {

		this.removeFocus();

	}

	private onPlayerTick ( e: PlayerUpdateData ) {

	}

	private removeFocus () {

		const entities = [ ...ScenarioInstance.scenario.objects.values() ];

		if ( entities.length === 0 ) {

			TvConsole.warn( 'No Entity to focus' );

			return;
		}

		this.threeService.removeFocusTarget();
		this.threeService.camera.position.copy( this.originalPosition );
		this.threeService.camera.quaternion.copy( this.originalQuaternion );

	}

}
