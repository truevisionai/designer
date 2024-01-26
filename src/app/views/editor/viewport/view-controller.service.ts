/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMapControls, TvOrbitControls } from "../../../objects/tv-orbit-controls";
import * as THREE from "three";
import { Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CameraService } from "../../../renderer/camera.service";
import { IViewportController } from "../../../objects/i-viewport-controller";

@Injectable( {
	providedIn: 'root'
} )
export class ViewControllerService {

	private controls: IViewportController;

	private target: Object3D;

	// This will create a vector to store the offset position from the object
	private p_offset = new THREE.Vector3( 20, 20, 20 );

	private o_offset = new THREE.Vector3( 0, 0, 100 );

	constructor (
		private cameraService: CameraService
	) {
		this.cameraService.cameraChanged.subscribe( ( camera ) => this.onCameraChanged( camera ) );
	}

	init ( camera: THREE.Camera, canvas: HTMLCanvasElement ) {

		this.controls = TvOrbitControls.getNew( camera, canvas );

	}

	enableControls () {

		this.controls.enabled = true;

	}

	disableControls () {

		this.controls.enabled = false;

	}

	setFocusTarget ( target: THREE.Object3D ) {

		this.target = target;
		this.controls.setTarget( target.position );

	}

	getFocusTarget () {

		return this.target;

	}

	removeFocusTarget () {

		this.controls.setTarget( this.target?.position.clone() ?? new Vector3() );
		this.target = null;

	}

	update ( delta: number ) {

		this.controls.update();

	}

	focus ( obj: THREE.Object3D ) {

		//// move the camera on top of the object
		//this.camera.position.setX( obj.position.x );
		//this.camera.position.setY( obj.position.y );
		//
		//// focus the camera on the object
		//this.camera.lookAt( obj.position );
		//
		//// change the target position for controls
		//this.controls.setTarget( obj.position );
		//this.controls.update();
		//
		//( this.camera as any ).updateProjectionMatrix();
	}

	private onCameraChanged ( camera: THREE.Camera ) {

		this.controls.setCamera( camera );

		const target = this.controls.getTarget();

		if ( target ) camera.lookAt( target.x, target.y, target.z );

		if ( camera instanceof OrthographicCamera ) {

			this.controls.setRotateEnabled( false );

		} else if ( camera instanceof PerspectiveCamera ) {

			this.controls.setRotateEnabled( true );
		}

	}

	updateCameraPosition () {

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
}
