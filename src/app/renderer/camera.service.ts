/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import * as THREE from "three";
import { Camera, Euler, Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { AppConfig } from "../app.config";
import { SceneService } from "../services/scene.service";
import { CanvasService } from "./canvas.service";

@Injectable( {
	providedIn: 'root'
} )
export class CameraService {

	public cameraChanged = new EventEmitter<Camera>();

	private currentCameraIndex = 0;

	private cameras: THREE.Camera[] = [];

	// This will create a vector to store the offset position from the object
	private p_offset = new THREE.Vector3( 20, 20, 20 );

	private o_offset = new THREE.Vector3( 0, 0, 100 );

	get camera () {
		return this.cameras[ this.currentCameraIndex ];
	}

	constructor (
		private canvasService: CanvasService,
	) {
		this.canvasService.resized.subscribe( () => this.onCanvasResized() );
	}

	createOrthographicCamera ( left: number, right: number, top: number, bottom: number, near: number = 1, far: number = 100000 ): OrthographicCamera {

		// higher near value >= 10 reduces the z fighting that
		// happens in rendering road markings
		// const near = 1;
		// const far = 100000;

		const orthographicCamera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );

		orthographicCamera.position.set( 0, 0, 50 );

		orthographicCamera.up.copy( AppConfig.DEFAULT_UP );

		return orthographicCamera;

	}

	init (): void {

		// higher near value >= 10 reduces the z fighting that
		// happens in rendering road markings
		const near = 1;
		const far = 100000;

		const width = 791.88;
		const height = 606;
		const otherDivider = 4;

		const left = width / -otherDivider;
		const right = width / otherDivider;
		const top = height / otherDivider;
		const bottom = height / -otherDivider;

		const orthographicCamera = this.createOrthographicCamera( left, right, top, bottom, near, far );

		const perspectiveCamera = new THREE.PerspectiveCamera( 50, width / height, near, far );
		perspectiveCamera.position.set( 0, -50, 200 );
		perspectiveCamera.up.copy( AppConfig.DEFAULT_UP );

		this.cameras.push( orthographicCamera );
		this.cameras.push( perspectiveCamera );

		for ( let i = 0; i < this.cameras.length; i++ ) {

			this.cameras[ i ].lookAt( 0, 0, 0 );
			this.cameras[ i ].userData.initialPosition = this.cameras[ i ].position.clone();
			this.cameras[ i ].userData.initialUp = this.cameras[ i ].up.clone();
			this.cameras[ i ].userData.initialRotation = this.cameras[ i ].rotation.clone();

			SceneService.addEditorObject( this.cameras[ i ] );
		}

		if ( this.camera[ 'isOrthographicCamera' ] ) {

			( this.camera as OrthographicCamera ).updateProjectionMatrix();

		} else if ( this.camera[ 'isPerspectiveCamera' ] ) {

			( this.camera as PerspectiveCamera ).updateProjectionMatrix();

		}

	}

	changeCamera (): void {

		const oldPosition = this.camera.position.clone();

		if ( this.currentCameraIndex + 1 >= this.cameras.length ) {

			this.currentCameraIndex = 0;

		} else {

			this.currentCameraIndex++;

		}

		this.camera.position.copy( oldPosition );

		this.cameraChanged.emit( this.camera );

	}

	private onCanvasResized (): void {

		const aspect = this.canvasService.aspect;

		this.cameras.forEach( camera => {

			if ( camera instanceof OrthographicCamera ) {

				camera.left = camera.bottom * aspect;

				camera.right = camera.top * aspect;

				camera.updateProjectionMatrix();

			} else if ( camera instanceof PerspectiveCamera ) {

				camera.aspect = aspect;

				camera.updateProjectionMatrix();
			}

		} );

	}

	updateCameraPosition (): void {

		//const target = this.getFocusTarget();
		//
		//if ( !target ) return;
		//
		//if ( this.camera instanceof OrthographicCamera ) {
		//
		//	// This will calculate the camera position based on the offset from the object
		//	this.camera.position.copy( target.position ).add( this.o_offset );
		//
		//} else if ( this.camera instanceof PerspectiveCamera ) {
		//
		//	// This will calculate the camera position based on the offset from the object
		//	this.camera.position.copy( target.position ).add( this.p_offset );
		//
		//}
		//
		//this.camera.lookAt( target.position );

	}

	resetCamera (): void {

		if ( this.camera instanceof OrthographicCamera ) {

			this.resetOrthographicCamera( this.camera );

		} else if ( this.camera instanceof PerspectiveCamera ) {

			this.resetPerspectiveCamera( this.camera );

		}

	}

	private resetOrthographicCamera ( camera: OrthographicCamera ): void {

		this.camera.position.copy( this.camera.userData.initialPosition ?? new Vector3( 0, 0, 200 ) );

		this.camera.rotation.copy( this.camera.userData.initialRotation ?? new Euler() );

		this.camera.up.copy( this.camera.userData.initialUp ?? AppConfig.DEFAULT_UP );

		camera.lookAt( 0, 0, 0 );

		camera.updateProjectionMatrix();

	}

	private resetPerspectiveCamera ( camera: PerspectiveCamera ): void {

		this.camera.position.copy( this.camera.userData.initialPosition ?? new Vector3( 0, -50, 200 ) );

		this.camera.rotation.copy( this.camera.userData.initialRotation ?? new Euler() );

		this.camera.up.copy( this.camera.userData.initialUp ?? AppConfig.DEFAULT_UP );

		camera.lookAt( 0, 0, 0 );

		camera.updateProjectionMatrix();

	}

	computeDistance ( target: Vector3, camera?: Camera ): number {

		camera = camera ?? this.camera;

		if ( camera instanceof THREE.OrthographicCamera ) {

			const cameraWidth = camera.right - camera.left;

			const cameraHeight = camera.top - camera.bottom;

			const cameraDiagonalSize = Math.sqrt( cameraWidth * cameraWidth + cameraHeight * cameraHeight );

			return cameraDiagonalSize / ( 2 * camera.zoom );

		} else if ( camera instanceof THREE.PerspectiveCamera ) {

			const cameraPosition = camera.position;

			return cameraPosition.distanceTo( target );

		}

		return 0;

	}
}
