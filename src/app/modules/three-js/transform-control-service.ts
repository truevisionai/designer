import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ThreeService } from './three.service';
import * as THREE from 'three';
import { SceneService } from 'app/core/services/scene.service';
import { CommandHistory } from 'app/services/command-history';
import { SetPositionCommand } from './commands/set-position-command';

@Injectable( {
	providedIn: 'root'
} )
export class TransformControlService {

	public static instance: TransformControlService;

	private control: TransformControls;

	private oldPosition: Vector3;

	private newPosition: Vector3;

	constructor ( private threeService: ThreeService ) {

		TransformControlService.instance = this;

	}

	get camera () {
		return this.threeService.camera;
	}

	init () {

		const control = this.control = new TransformControls( this.camera, this.threeService.renderer.domElement );

		// control.addEventListener( 'change', render );
		control.addEventListener( 'dragging-changed', ( event ) => {

			if ( event.value ) this.oldPosition = control.object?.position?.clone();

			if ( !event.value ) {

				this.newPosition = control.object?.position?.clone();

				if ( control.object && this.oldPosition && this.newPosition ) {

					CommandHistory.execute( new SetPositionCommand( control.object, this.newPosition, this.oldPosition ) );

					this.newPosition = null;

					this.oldPosition = null;

				}

			}

			this.threeService.controls.setEnabled( !event.value );

		} );

		SceneService.add( control );

		this.threeService.cameraChanged.subscribe( ( camera ) => {

			this.control.camera = camera;

		} );

		// window.addEventListener( 'resize', onWindowResize );
		// window.addEventListener( 'keydown', ( event ) => {
		// 	switch ( event.keyCode ) {
		// 		case 81: // Q
		// 			control.setSpace( control.space === 'local' ? 'world' : 'local' );
		// 			break;
		// 		case 16: // Shift
		// 			control.setTranslationSnap( 100 );
		// 			control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
		// 			control.setScaleSnap( 0.25 );
		// 			break;
		// 		case 87: // W
		// 			control.setMode( 'translate' );
		// 			break;
		// 		case 69: // E
		// 			control.setMode( 'rotate' );
		// 			break;
		// 		case 82: // R
		// 			control.setMode( 'scale' );
		// 			break;
		// 		// case 67: // C
		// 		// 	const position = this.camera.position.clone();
		// 		// 	// this.camera = this.camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
		// 		// 	this.camera.position.copy( position );
		// 		// 	// orbit.object = this.camera;
		// 		// 	control.camera = this.camera;
		// 		// 	// currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
		// 		// 	// onWindowResize();
		// 		// 	break;
		// 		// case 86: // V
		// 		// 	const randomFoV = Math.random() + 0.1;
		// 		// 	const randomZoom = Math.random() + 0.1;
		// 		// 	cameraPersp.fov = randomFoV * 160;
		// 		// 	cameraOrtho.bottom = - randomFoV * 500;
		// 		// 	cameraOrtho.top = randomFoV * 500;
		// 		// 	cameraPersp.zoom = randomZoom * 5;
		// 		// 	cameraOrtho.zoom = randomZoom * 5;
		// 		// 	onWindowResize();
		// 		// 	break;
		// 		case 187:
		// 		case 107: // +, =, num+
		// 			control.setSize( control.size + 0.1 );
		// 			break;
		// 		case 189:
		// 		case 109: // -, _, num-
		// 			control.setSize( Math.max( control.size - 0.1, 0.1 ) );
		// 			break;
		// 		case 88: // X
		// 			control.showX = !control.showX;
		// 			break;
		// 		case 89: // Y
		// 			control.showY = !control.showY;
		// 			break;
		// 		case 90: // Z
		// 			control.showZ = !control.showZ;
		// 			break;
		// 		case 32: // Spacebar
		// 			control.enabled = !control.enabled;
		// 			break;
		// 		case 27: // Esc
		// 			control.reset();
		// 			break;
		// 	}
		// } );
		// window.addEventListener( 'keyup', function ( event ) {
		// 	switch ( event.keyCode ) {
		// 		case 16: // Shift
		// 			control.setTranslationSnap( null );
		// 			control.setRotationSnap( null );
		// 			control.setScaleSnap( null );
		// 			break;
		// 	}
		// } );
	}

	attach ( object: THREE.Object3D ) {

		this.control.attach( object );

	}

	detach () {

		this.control.detach();

	}

}
