/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Camera, Euler, Material, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { IEngine } from '../../core/services/IEngine';
import { SceneService } from '../../core/services/scene.service';
import { IViewportController } from './objects/i-viewport-controller';
import { TvOrbitControls } from './objects/tv-orbit-controls';
import { TvViewHelper } from './objects/tv-view-helper';
import { ScenarioEnvironment } from '../scenario/models/actions/scenario-environment';

@Injectable( {
	providedIn: 'root'
} )
export class ThreeService implements IEngine {

	ambientLight: THREE.AmbientLight;

	static bgForClicks: THREE.Mesh;
	cameraChanged = new EventEmitter<Camera>();
	public controls: IViewportController;
	public canvas: HTMLCanvasElement;
	public renderer: THREE.WebGLRenderer;
	public mouse: THREE.Vector2 = new THREE.Vector2;
	public image: THREE.Mesh;
	public canvasWidth: number;
	public canvasHeight: number;
	public leftOffset: number;
	public topOffset: number;
	public ORTHO_DRIVER = 4;
	viewHelper: TvViewHelper;
	viewHelperCanavs: HTMLCanvasElement;
	private currentCameraIndex = 0;
	private cameras: THREE.Camera[] = [];
	private composer: EffectComposer;
	private transformControls: TransformControls;
	private light: THREE.AmbientLight;
	private objectPositionOnDown: THREE.Vector3 = null;
	private target: Object3D;
	// This will create a vector to store the offset position from the object
	private p_offset = new THREE.Vector3( 20, 20, 20 );
	private o_offset = new THREE.Vector3( 0, 0, 100 );

	environment: ScenarioEnvironment = new ScenarioEnvironment( 'Default' );

	private gridHelper: THREE.GridHelper;
	private gridHelper2: THREE.GridHelper;

	constructor () {

	}

	public get camera () {
		return this.cameras[ this.currentCameraIndex ];
	}

	public get scene () {
		return SceneService.scene;
	}

	setupScene ( canvas: HTMLCanvasElement, renderer: WebGLRenderer ): void {

		this.canvas = canvas;
		this.renderer = renderer;

		SceneService.scene.background = new THREE.Color( 0x333333 );

		this.createCameras();

		this.createSceneHelpers();

		this.setEnvironment( this.environment, );
	}

	setEnvironment ( environment: ScenarioEnvironment, removeOld = false ) {

		if ( removeOld ) {

			SceneService.removeHelper( this.environment?.weather?.sun?.light );

			SceneService.removeHelper( this.ambientLight );

			// if ( this.environment.weather.domeImage.sphereMesh ) {
			// 	SceneService.removeHelper( this.environment.weather.domeImage.sphereMesh );
			// }

		}

		// set new environment
		SceneService.addHelper( environment.weather.sun.light );

		this.ambientLight = new THREE.AmbientLight( 0xE6E6E6, 1 );

		SceneService.addHelper( this.ambientLight );

		this.environment = environment;
	}

	createControls (): void {

		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );
		// this.controls = EditorControls.getNew( this.camera, this.canvas );

	}

	createTransformControls (): void {

		// const self: ThreeService = this;

		// this.transformControls = new TransformControls( this.camera, this.canvas );

		// this.transformControls.addEventListener( 'dragging-changed', function ( event ) {

		// 	this.controls.enabled = !event.value;

		// } );

		// this.transformControls.addEventListener( 'mouseDown', () => {

		// 	var object = self.transformControls.object;


		// 	this.objectPositionOnDown = object.position.clone();
		// 	// this.objectRotationOnDown = object.rotation.clone();
		// 	// this.objectScaleOnDown = object.scale.clone();

		// 	this.controls.enabled = false;

		// } );

		// this.transformControls.addEventListener( 'mouseUp', function () {

		// 	var object = self.transformControls.object;

		// 	if ( object !== undefined ) {

		// 		switch ( self.transformControls.getMode() ) {

		// 			case 'translate':

		// 				if ( !self.objectPositionOnDown.equals( object.position ) ) {

		// 					CommandHistory.execute( new SetPositionCommand( object, object.position, self.objectPositionOnDown ) );

		// 				}

		// 				break;

		// 			default:
		// 				break;
		// 		}

		// 	}

		// 	this.controls.enabled = true;

		// } );


		// SceneService.addHelper( this.transformControls );

	}

	createGridHelper (): void {

		this.gridHelper = this.createGridHelperNew( 1000, 100, 0.5 );
		this.gridHelper2 = this.createGridHelperNew( 2000, 200, 0 );

		SceneService.addHelper( this.gridHelper );
		SceneService.addHelper( this.gridHelper2 );

	}

	createGridHelperNew ( size: number, divisions: number, opacity: number ): THREE.GridHelper {

		const gridHelper = new THREE.GridHelper( size, divisions );

		( gridHelper.material as THREE.Material ).transparent = true;
		( gridHelper.material as THREE.Material ).opacity = opacity;
		( gridHelper.material as THREE.Material ).needsUpdate = false;

		// to adjust with up Z
		gridHelper.rotateX( Maths.Deg2Rad * 90 );

		return gridHelper;
	}

	updateGridHelper ( camera: THREE.Camera ): void {

		let distance;

		if ( this.camera instanceof OrthographicCamera ) {

			// Calculate the camera's dimensions
			const cameraWidth = this.camera.right - this.camera.left;
			const cameraHeight = this.camera.top - this.camera.bottom;

			// Calculate the diagonal size of the camera's visible area
			const cameraDiagonalSize = Math.sqrt( cameraWidth * cameraWidth + cameraHeight * cameraHeight );

			// Calculate the approximate camera distance using the zoom and the diagonal size
			distance = ( cameraDiagonalSize / ( 2 * this.camera.zoom ) );

		} else if ( this.camera instanceof PerspectiveCamera ) {

			distance = camera.position.distanceTo( this.gridHelper.position );

		}

		// Calculate new scale based on the camera distance
		const newScale = Math.max( 1, Math.floor( distance / 500 ) );

		// Update the scale of both grid helpers
		this.gridHelper.scale.set( newScale, newScale, newScale );
		this.gridHelper2.scale.set( newScale * 2, newScale * 2, newScale * 2 );

		// Calculate the fade factor based on the camera distance
		const fadeFactor = ( distance % 1000 ) / 1000;

		// Update the opacities of both grid helpers
		( this.gridHelper.material as THREE.Material ).opacity = 0.5 * ( 1 - fadeFactor );
		( this.gridHelper2.material as THREE.Material ).opacity = 0.5 * fadeFactor;

		( this.gridHelper.material as THREE.Material ).needsUpdate = true;
		( this.gridHelper2.material as THREE.Material ).needsUpdate = true;

	}

	createSceneHelpers (): any {

		this.setupPostProcessing();

		this.createControls();

		this.createDragControls();

		this.createGridHelper();

		// this.createTransformControls();

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

		SceneService.addHelper( ThreeService.bgForClicks );
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
		this.controls.setTarget( obj.position );
		this.controls.update();

		( this.camera as any ).updateProjectionMatrix();
	}

	reset () {

		SceneService.clear();

	}

	/**
	 * Public methods
	 */

	public select ( obj: Object3D ) {

		// this.transformControls.attach( obj );

	}

	public deselect () {

		// this.transformControls.detach();

	}

	public changeCamera () {

		const oldPosition = this.camera.position.clone();

		if ( this.currentCameraIndex + 1 >= this.cameras.length ) {

			this.currentCameraIndex = 0;

		} else {

			this.currentCameraIndex++;

		}

		this.camera.position.copy( oldPosition );

		this.controls.setCamera( this.camera );

		const target = this.controls.getTarget();

		if ( target ) this.camera.lookAt( target.x, target.y, target.z );

		if ( this.camera instanceof OrthographicCamera ) {

			this.controls.setRotateEnabled( false );

		} else if ( this.camera instanceof PerspectiveCamera ) {

			this.controls.setRotateEnabled( true );
		}

		this.cameraChanged.emit( this.camera );

		this.onWindowResized();
	}

	onWindowResized () {

		const width = this.canvasWidth;
		const height = this.canvasHeight;

		const aspect = width / height;

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

		this.createViewHelper();
	}

	createViewHelper () {

		this.viewHelper?.dispose();

		delete this.viewHelper;

		try {

			this.viewHelper = new TvViewHelper( this.camera as any, this.viewHelperCanavs );

			// console.log( this.viewHelper.up );
			// this.viewHelper.up.copy( AppConfig.DEFAULT_UP );

			const container = this.viewHelper.domElement.parentElement;

			const box = container.getBoundingClientRect();

			const height = 128;

			const left = box.left;
			const top = box.top + box.height - height;

			this.viewHelperCanavs.style.left = `${ left }px`;
			this.viewHelperCanavs.style.top = `${ top }px`;


		} catch ( error ) {

			SnackBar.error( 'Error in creating in ViewHelper' );
			SnackBar.error( error );

		}

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

	updateCameraPosition () {

		const target = this.getFocusTarget();

		if ( !target ) return;

		if ( this.camera instanceof OrthographicCamera ) {

			// This will calculate the camera position based on the offset from the object
			this.camera.position.copy( target.position ).add( this.o_offset );


		} else if ( this.camera instanceof PerspectiveCamera ) {

			// This will calculate the camera position based on the offset from the object
			this.camera.position.copy( target.position ).add( this.p_offset );

		}

		this.camera.lookAt( target.position );

	}

	resetCamera () {

		this.camera.position.copy( this.camera.userData.initialPosition ?? new Vector3( 0, 0, 50 ) );

		this.camera.rotation.copy( this.camera.userData.initialRotation ?? new Euler() );

		this.camera.up.copy( this.camera.userData.initialUp ?? AppConfig.DEFAULT_UP );

		( this.camera as any ).lookAt( 0, 0, 0 );

		( this.camera as any ).updateProjectionMatrix();
	}

	wireframeMode ( showWireframe: boolean ) {

		SceneService.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material.wireframe = showWireframe;

			}

		} );

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
		orthographicCamera.up.copy( AppConfig.DEFAULT_UP );

		const perspectiveCamera = new THREE.PerspectiveCamera( 50, width / height, near, far );
		perspectiveCamera.position.set( 0, 5, 10 );
		perspectiveCamera.up.copy( AppConfig.DEFAULT_UP );

		this.cameras.push( orthographicCamera );
		this.cameras.push( perspectiveCamera );

		for ( let i = 0; i < this.cameras.length; i++ ) {

			this.cameras[ i ].lookAt( 0, 0, 0 );
			this.cameras[ i ].userData.initialPosition = this.cameras[ i ].position.clone();
			this.cameras[ i ].userData.initialUp = this.cameras[ i ].up.clone();
			this.cameras[ i ].userData.initialRotation = this.cameras[ i ].rotation.clone();


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
