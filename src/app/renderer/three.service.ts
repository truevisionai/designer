/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Maths } from 'app/utils/maths';
import { SceneService } from '../services/scene.service';
import { ScenarioEnvironment } from '../scenario/models/actions/scenario-environment';
import { DEFAULT_AMBIENT_LIGHT } from './default.config';
import { CameraService } from "./camera.service";

import * as THREE from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class ThreeService {

	private ambientLight: THREE.AmbientLight;

	public environment: ScenarioEnvironment = new ScenarioEnvironment( 'Default' );

	constructor (
		private cameraService: CameraService,
		private sceneService: SceneService,
	) {

	}

	get camera () {

		return this.cameraService.camera;

	}

	get scene () {

		return this.sceneService.scene;

	}

	setupScene (): void {

		this.createSceneHelpers();

		this.setEnvironment( this.environment );

	}

	setEnvironment ( environment: ScenarioEnvironment, removeOld: boolean = false ): void {

		if ( removeOld ) {

			SceneService.removeFromEditor( this.environment?.weather?.sun?.light );

			SceneService.removeFromEditor( this.ambientLight );

			// if ( this.environment.weather.domeImage.sphereMesh ) {
			// 	SceneService.removeHelper( this.environment.weather.domeImage.sphereMesh );
			// }

		}

		// set new environment
		SceneService.addEditorObject( environment.weather.sun.light );

		SceneService.addEditorObject( DEFAULT_AMBIENT_LIGHT );

		this.environment = environment;
	}

	createGridHelper (): void {

		const gridHelper = new THREE.GridHelper( 1000, 100 );

		gridHelper.material.transparent = true;
		gridHelper.material.opacity = 0.5;
		gridHelper.material.needsUpdate = false;

		// to adjust with up Z
		gridHelper.rotateX( Maths.Deg2Rad * 90 );

		SceneService.addEditorObject( gridHelper );

	}

	createSceneHelpers (): any {

		this.createGridHelper();

		this.addAxesHelper();

	}

	/**
	 *
	 * @param object
	 * @param raycasting
	 * @deprecated use SceneService.add instead
	 */
	add ( object: THREE.Object3D, raycasting: boolean = false ): any {

		SceneService.addToMain( object, raycasting );
	}

	remove ( object: THREE.Object3D, raycasting: boolean = false ): any {

		SceneService.removeFromMain( object, raycasting );

	}

	reset (): void {

		SceneService.clear();

	}

	wireframeMode ( showWireframe: boolean ): void {

		this.sceneService.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material.wireframe = showWireframe;

			}

		} );

	}

	private addAxesHelper (): void {

		SceneService.addEditorObject( new THREE.AxesHelper( 3000 ) );

	}
}
