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
	) {

	}

	focus ( object: THREE.Object3D<THREE.Object3DEventMap> ): void {

		console.error( 'Method not implemented.' );

	}

	select ( object: THREE.Object3D<THREE.Object3DEventMap> ): void {

		console.error( 'Method not implemented.' );

	}

	deselect ( object: THREE.Object3D<THREE.Object3DEventMap> ): void {

		console.error( 'Method not implemented.' );

	}

	public get camera () {

		return this.cameraService.camera;

	}

	public get scene () {

		return SceneService.scene;

	}

	setupScene (): void {

		this.createSceneHelpers();

		this.setEnvironment( this.environment );

	}

	setEnvironment ( environment: ScenarioEnvironment, removeOld = false ) {

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
	add ( object: THREE.Object3D, raycasting = false ): any {

		SceneService.addToMain( object, raycasting );
	}

	remove ( object: THREE.Object3D, raycasting = false ): any {

		SceneService.removeFromMain( object, raycasting );

	}

	reset () {

		SceneService.clear();

	}

	wireframeMode ( showWireframe: boolean ) {

		SceneService.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material.wireframe = showWireframe;

			}

		} );

	}

	private addAxesHelper () {

		SceneService.addEditorObject( new THREE.AxesHelper( 3000 ) );

	}
}
