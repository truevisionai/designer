/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, Output } from '@angular/core';
import { TvMapControls, TvOrbitControls } from "../../../objects/tv-orbit-controls";
import * as THREE from "three";
import { Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CameraService } from "../../../renderer/camera.service";
import { IViewportController } from "../../../objects/i-viewport-controller";

@Injectable( {
	providedIn: 'root'
} )
export class ViewControllerService {

	static instance: ViewControllerService;

	@Output() updated = new EventEmitter<any>();

	private controls: IViewportController;

	private target: Object3D;

	constructor (
		private cameraService: CameraService
	) {
		ViewControllerService.instance = this;
		this.cameraService.cameraChanged.subscribe( ( camera ) => this.onCameraChanged( camera ) );
	}

	init ( camera: THREE.Camera, canvas: HTMLCanvasElement ): void {

		const controls = TvOrbitControls.getNew( camera, canvas );

		controls.addEventListener( 'end', () => {

			this.updated.emit( this.cameraService.camera );

		} );

		this.controls = controls;
	}

	enableControls (): void {

		this.controls.enabled = true;

	}

	disableControls (): void {

		this.controls.enabled = false;

	}

	setFocusTarget ( target: Vector3 ): void {

		// this.target = target;
		this.controls.setTarget( target );

	}

	getFocusTarget () {

		return this.target;

	}

	getTarget () {

		return this.target?.position || this.controls.getTarget();

	}

	removeFocusTarget (): void {

		this.controls.setTarget( this.target?.position.clone() ?? new Vector3() );
		this.target = null;

	}

	update ( delta: number ): void {

		this.controls.update();

	}

	focus ( obj: THREE.Object3D ): void {

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

	private onCameraChanged ( camera: THREE.Camera ): void {

		this.controls.setCamera( camera );

		const target = this.controls.getTarget();

		if ( target ) camera.lookAt( target.x, target.y, target.z );

		if ( camera instanceof OrthographicCamera ) {

			this.controls.setRotateEnabled( false );

		} else if ( camera instanceof PerspectiveCamera ) {

			this.controls.setRotateEnabled( true );
		}

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

	getDistance () {

		if ( this.controls instanceof TvOrbitControls ) {

			return this.controls?.getDistance();

		}

		return 0;
	}
}
