/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';

import { Maths } from 'app/utils/maths';

import * as THREE from 'three';
import { Material, Object3D, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { IEngine } from '../../core/services/IEngine';
import { SceneService } from '../../core/services/scene.service';
import { SetPositionCommand } from './commands/set-position-command';
import './EnableThreeExamples';
import { IViewportController } from './objects/i-viewport-controller';
import { TvOrbitControls } from './objects/tv-orbit-controls';

@Injectable( {
	providedIn: 'root'
} )
export class ThreeService implements IEngine {


	public static controls: IViewportController;
	static bgForClicks: THREE.Mesh;
	public canvas: HTMLCanvasElement;
	public renderer: THREE.WebGLRenderer;
	public mouse: THREE.Vector2 = new THREE.Vector2;
	public image: THREE.Mesh;
	public canvasWidth: number;
	public canvasHeight: number;
	public leftOffset: number;
	public topOffset: number;
	public ORTHO_DRIVER = 4;
	private currentCameraIndex = 0;
	private cameras: THREE.Camera[] = [];
	private composer: EffectComposer;
	private transformControls: TransformControls;
	private light: THREE.AmbientLight;
	private objectPositionOnDown: THREE.Vector3 = null;

	constructor () {

	}

	public get camera () {
		return this.cameras[ this.currentCameraIndex ];
	}

	setupScene ( canvas: HTMLCanvasElement, renderer: WebGLRenderer ): void {

		this.canvas = canvas;
		this.renderer = renderer;

		// const box = this.getCanvasBounds();
		// this.CANVAS_WIDTH = box.width === 0 ? this.CANVAS_WIDTH : box.width;
		// this.CANVAS_HEIGHT = box.height === 0 ? this.CANVAS_HEIGHT : box.height;CO
		SceneService.scene.background = new THREE.Color( COLOR.BLACK );// new THREE.Color( 0x2e2e2e );

		this.createCameras();

		this.createSceneHelpers();
	}

	addDirectionalLight () {

		const directionaLight = new THREE.DirectionalLight( '0xffffff', 1 );

		directionaLight.position.set( 5, 10, 7.5 );

		SceneService.addHelper( directionaLight );

		SceneService.addHelper( directionaLight.target );

		const ambientLight = new THREE.AmbientLight( 0xE6E6E6, 1 );

		SceneService.addHelper( ambientLight );

	}

	createControls (): void {

		ThreeService.controls = TvOrbitControls.getNew( this.camera, this.canvas );
		// ThreeService.controls = EditorControls.getNew( this.camera, this.canvas );

	}

	createTransformControls (): void {

		const self: ThreeService = this;

		this.transformControls = new TransformControls( this.camera, this.canvas );

		this.transformControls.addEventListener( 'dragging-changed', function ( event ) {

			ThreeService.controls.enabled = !event.value;

		} );

		this.transformControls.addEventListener( 'mouseDown', () => {

			var object = self.transformControls.object;


			this.objectPositionOnDown = object.position.clone();
			// this.objectRotationOnDown = object.rotation.clone();
			// this.objectScaleOnDown = object.scale.clone();

			ThreeService.controls.enabled = false;

		} );

		this.transformControls.addEventListener( 'mouseUp', function () {

			var object = self.transformControls.object;

			if ( object !== undefined ) {

				switch ( self.transformControls.getMode() ) {

					case 'translate':

						if ( !self.objectPositionOnDown.equals( object.position ) ) {

							CommandHistory.execute( new SetPositionCommand( object, object.position, self.objectPositionOnDown ) );

						}

						break;

					default:
						break;
				}

			}

			ThreeService.controls.enabled = true;

		} );


		SceneService.addHelper( this.transformControls );

	}

	createGridHelper (): void {

		var gridHelper = new THREE.GridHelper( 1000, 100 );

		( gridHelper.material as Material ).transparent = true;
		( gridHelper.material as Material ).opacity = 0.2;
		( gridHelper.material as Material ).needsUpdate = false;

		// to adjust with up Z
		gridHelper.rotateX( Maths.Deg2Rad * 90 );

		SceneService.addHelper( gridHelper );

	}

	createSceneHelpers (): any {

		this.addDirectionalLight();

		this.setupPostProcessing();

		this.createControls();

		this.createDragControls();

		this.createGridHelper();

		this.createTransformControls();

		this.createBackgroundPlaneForClicks();

		this.addAxesHelper();
	}

	createBackgroundPlaneForClicks () {

		ThreeService.bgForClicks = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshBasicMaterial( {
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0
		} ) );

		ThreeService.bgForClicks.name = 'bgForClicks';

		SceneService.add( ThreeService.bgForClicks, true );
	}

	setupPostProcessing (): any {

		// // TODO : Move this to component, listen to resize to fix blurriness
		//
		// // postprocessing
		// this.composer = new THREE.EffectComposer( this.renderer );
		//
		// let renderPass = new THREE.RenderPass( this.scene, this.camera );
		//
		//
		// let copyPass = new THREE.ShaderPass( THREE.CopyShader );
		// copyPass.renderToScreen = false;
		//
		// let res = new Vector2( this.CANVAS_WIDTH, this.CANVAS_HEIGHT );
		// let outlinePass = new OutlinePass( res, this.scene, this.camera );
		//
		// this.composer.addPass( renderPass );
		// // this.composer.addPass( copyPass );
		// // this.composer.addPass( outlinePass );

	}

	createDragControls (): any {


	}

	// addImageSprite (): any {

	//     const self: ThreeService = this;

	//     // const image = "assets/checkered.png";
	//     const image = 'assets/buildings.jpeg';

	//     var map = new THREE.TextureLoader().load( image, function ( texture ) {

	//         var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff } );
	//         var sprite = new THREE.Sprite( material );

	//         sprite.scale.set( texture.image.width, 2622, 1 );

	//         sprite.position.set( texture.image.width / 2, texture.image.height / 2, 0 );
	//         // self.camera.position.set( texture.image.width / 2, texture.image.height / 2, 20 );
	//         // self.camera.lookAt( new THREE.Vector3( texture.image.width / 2, texture.image.height / 2, 0 ) );
	//         // self.camera.up.set( 0, 1, 0 );
	//         // self.camera.lookAt( 1311, 1311, 0 );
	//         // self.camera.position.set( 600, 0, 0 );
	//         // self.camera.position.z = 20;

	//         self.camera.updateProjectionMatrix();

	//         self.add( sprite, true );

	//     } );

	// }

	// addImageScreen (): any {
	//
	//     const self: ThreeService = this;
	//
	//     // const url = "http://true-label.test/images/checkered.png";
	//     // const url = "https://picsum.photos/1200/900";
	//     // const url = "assets/highway.jpg";
	//     const url = 'assets/pedestrians/Frame_ (1).png';
	//     // const url = "assets/buildings.jpeg";
	//     // const url = "assets/sample.png";
	//
	//     // load a texture, set wrap mode to repeat
	//     const textureLoader = new THREE.TextureLoader();
	//
	//     textureLoader.crossOrigin = '';
	//
	//     textureLoader.load( url, function ( texture ) {
	//
	//         texture.wrapS = THREE.RepeatWrapping;
	//         texture.wrapT = THREE.RepeatWrapping;
	//
	//         var geometry = new THREE.PlaneGeometry( texture.image.width, texture.image.height );
	//         var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
	//
	//         self.image = new THREE.Mesh( geometry, material );
	//
	//         self.image.userData.is_image = true;
	//
	//         self.image.position.set( texture.image.width / 2, texture.image.height / 2, 0 );
	//
	//         self.camera.position.set( texture.image.width / 2, texture.image.height / 2, 20 );
	//
	//         self.orbitControls.target.set( texture.image.width / 2, texture.image.height / 2, 0 );
	//
	//         self.camera.updateProjectionMatrix();
	//
	//         self.add( self.image, true );
	//
	//     } );
	// }

	animate (): void {
		// window.addEventListener( 'DOMContentLoaded', () => {
		//   this.render();
		// } );

		// window.addEventListener( 'resize', () => {
		//   this.resize();
		// } );
	}

	// render () {
	//   requestAnimationFrame( () => {
	//     this.render();
	//   } );

	//   this.orbitControls.update();

	//   // update the picking ray with the camera and mouse position
	//   this.raycaster.setFromCamera( this.mouse, this.camera );

	//   // calculate objects intersecting the picking ray
	//   let intersects = this.raycaster.intersectObjects( this.raycastableObjects, false );

	//   // intersects = this.raycaster.intersectObjects( this.unclickableObjects, false );

	//   // Debug.log( intersects.length );

	//   // this.cursorOnBox = false;

	//   if ( intersects.length > 0 ) {

	//     // Debug.log( intersects.length );

	//     // this.sphereInter.visible = true;
	//     // this.sphereInter.position.copy( intersects[0].point );

	//     this.pointerPosition = intersects[0].point;

	//     this.cursorOnImage = true;
	//     this.pixelPosition.x = intersects[0].point.x;
	//     this.pixelPosition.y = intersects[0].point.y;

	//     if ( intersects[0].object.userData.is_annotation ) {
	//       // this.dragControls['enabled'] = true;
	//       this.cursorOnBox = true;
	//       this.objectInFocus = intersects[0].object;
	//       this.editorService.mouseOverAnnotationObject.emit( intersects[0].object.id );

	//     } else if ( intersects[0].object.userData.is_button ) {

	//       this.cursorOnBox = false;

	//       // this.dragControls['enabled'] = false;

	//       if ( intersects[0].object.userData.is_delete_button ) this.editorService.mouseOverDeleteButton.emit( 1 );

	//     } else {

	//       // this.dragControls['enabled'] = false;
	//       this.cursorOnBox = false;
	//       this.objectInFocus = null;

	//     }

	//     // Debug.log( this.cursorOnBox );

	//   } else {

	//     // this.sphereInter.visible = false;

	//     this.cursorOnImage = false;
	//     this.pixelPosition.x = 0;
	//     this.pixelPosition.y = 0;

	//   }

	//   // for ( var i = 0; i < intersects.length; i++ ) {
	//   //   intersects[i].object.material.color.set( 0xff0000 );
	//   // }

	//   // this.renderer.render( this.scene, this.camera );

	// }


	/**
	 *
	 * @param object
	 * @param raycasting
	 * @deprecated use SceneService.add instead
	 */
	add ( object: THREE.Object3D, raycasting = false ): any {

		SceneService.add( object, raycasting );
	}

	remove ( object: THREE.Object3D, raycasting = false ): any {

		SceneService.remove( object, raycasting );

	}

	public focus ( obj: THREE.Object3D ) {

		// move the camera on top of the object
		this.camera.position.setX( obj.position.x );
		this.camera.position.setY( obj.position.y );

		// focus the camera on the object
		this.camera.lookAt( obj.position );

		// change the target position for controls
		ThreeService.controls.setTarget( obj.position );
		ThreeService.controls.update();

		( this.camera as any ).updateProjectionMatrix();
	}

	reset () {

		SceneService.reset();

	}

	/**
	 * Public methods
	 */

	public select ( obj: Object3D ) {

		this.transformControls.attach( obj );

	}

	public deselect () {

		this.transformControls.detach();

	}

	public changeCamera () {

		if ( this.currentCameraIndex + 1 >= this.cameras.length ) {

			this.currentCameraIndex = 0;

		} else {

			this.currentCameraIndex++;

		}

		this.transformControls.detach();
		this.transformControls.object = this.camera;

		ThreeService.controls.setCamera( this.camera );

		if ( this.camera[ 'isOrthographicCamera' ] ) {

			ThreeService.controls.setScreenSpaceEnabled( true );
			ThreeService.controls.setRotateEnabled( false );

		} else if ( this.camera[ 'isPerspectiveCamera' ] ) {

			ThreeService.controls.setScreenSpaceEnabled( false );
			ThreeService.controls.setRotateEnabled( true );

		}

		ThreeService.controls.reset();
	}

	onWindowResized () {

		const width = this.canvasWidth;
		const height = this.canvasHeight;

		this.cameras.forEach( camera => {

			if ( camera[ 'isOrthographicCamera' ] ) {

				( camera as OrthographicCamera ).left = width / -this.ORTHO_DRIVER;
				( camera as OrthographicCamera ).right = width / this.ORTHO_DRIVER;
				( camera as OrthographicCamera ).top = height / this.ORTHO_DRIVER;
				( camera as OrthographicCamera ).bottom = height / -this.ORTHO_DRIVER;

				( camera as OrthographicCamera ).updateProjectionMatrix();

			} else if ( camera[ 'isPerspectiveCamera' ] ) {

				( camera as PerspectiveCamera ).aspect = width / height;

				( camera as PerspectiveCamera ).updateProjectionMatrix();
			}


		} );

	}

	enableControls () {

		ThreeService.controls.enabled = true;

	}

	disableControls () {

		ThreeService.controls.enabled = false;

	}

	private createCameras () {

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

		const orthographicCamera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
		orthographicCamera.position.set( 0, 0, 50 );
		orthographicCamera.up.set( 0, 0, 1 );

		const perspectiveCamera = new THREE.PerspectiveCamera( 50, width / height, near, far );
		perspectiveCamera.position.set( 0, 5, 10 );
		perspectiveCamera.up.set( 0, 0, 1 );

		this.cameras.push( orthographicCamera );
		this.cameras.push( perspectiveCamera );

		for ( let i = 0; i < this.cameras.length; i++ ) {

			this.cameras[ i ].lookAt( 0, 0, 0 );

			SceneService.addHelper( this.cameras[ i ] );
		}


		if ( this.camera[ 'isOrthographicCamera' ] ) {

			( this.camera as OrthographicCamera ).updateProjectionMatrix();

		} else if ( this.camera[ 'isPerspectiveCamera' ] ) {

			( this.camera as PerspectiveCamera ).updateProjectionMatrix();

		}
	}

	private addAxesHelper () {

		SceneService.addHelper( new THREE.AxesHelper( 3000 ) );

	}
}
