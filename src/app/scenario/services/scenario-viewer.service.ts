/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Quaternion, Vector3 } from 'three';
import { PlayerService, PlayerUpdateData } from '../../core/player.service';
import { TvConsole } from '../../core/utils/console';
import { ScenarioService } from './scenario.service';
import { ViewControllerService } from "../../views/editor/viewport/view-controller.service";
import { CameraService } from "../../renderer/camera.service";

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioViewerService {

	private originalPosition = new Vector3();

	private originalQuaternion = new Quaternion();

	constructor (
		private player: PlayerService,
		private viewController: ViewControllerService,
		private cameraService: CameraService,
		private scenarioService: ScenarioService,
	) {

		player.playerStarted.subscribe( e => this.onPlayerStarted() );
		player.playerResumed.subscribe( e => this.onPlayerResumed() );
		player.playerStopped.subscribe( e => this.onPlayerStopped() );
		player.playerPaused.subscribe( e => this.onPlayerPaused() );
		player.playerTick.subscribe( e => this.onPlayerTick( e ) );

	}

	setFocus () {

		const entities = this.scenarioService.entities;

		if ( entities.length === 0 ) {

			TvConsole.warn( 'No Entity to focus' );

			return;
		}

		const entity = entities[ 0 ];

		// Store original position and orientation
		this.originalPosition.copy( this.cameraService.camera.position );
		this.originalQuaternion.copy( this.cameraService.camera.quaternion );

		// this.viewController.setFocusTarget( entity );

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

		const entities = this.scenarioService.entities;

		if ( entities.length === 0 ) {

			TvConsole.warn( 'No Entity to focus' );

			return;
		}

		this.viewController.removeFocusTarget();
		this.cameraService.camera.position.copy( this.originalPosition );
		this.cameraService.camera.quaternion.copy( this.originalQuaternion );

	}

}
