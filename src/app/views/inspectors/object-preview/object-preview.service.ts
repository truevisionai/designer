/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { GameObject } from 'app/core/game-object';
import { IViewportController } from 'app/modules/three-js/objects/i-viewport-controller';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { AssetDatabase } from 'app/services/asset-database';
import { RoadStyle } from 'app/services/road-style.service';
import * as THREE from 'three';
import {
	AmbientLight,
	Box3,
	BoxGeometry,
	Color,
	DirectionalLight,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	Texture,
	TextureLoader,
	Vector3,
	WebGLRenderer
} from 'three';
import { TvRoadSign } from '../../../modules/tv-map/models/tv-road-sign.model';

const WIDTH = 200;
const HEIGHT = 200;

@Injectable( {
	providedIn: 'root'
} )
export class PreviewService {

	public instance: PreviewService;

	public renderer: WebGLRenderer;
	public frameId: number;

	public scene: Scene = new Scene;
	public camera: PerspectiveCamera;
	public controls: IViewportController;
	public ground: Mesh;

	private cube: Mesh;
	private sphere: Mesh;

	private groundTexture = new TextureLoader().load( 'assets/grass.jpg' );

	constructor () {

		this.ngOnInit();
		this.ngAfterViewInit();

	}

	ngOnInit () {

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = this.cube = new Mesh( geometry, material );

		this.scene.add( cube );

		this.sphere = new Mesh( new SphereGeometry( 1, 32, 32 ), new MeshBasicMaterial( { color: 0x00ff00 } ) );

		this.scene.add( this.sphere );

		this.resetCamera();

		const directionaLight = new DirectionalLight( '0xffffff', 1 );
		directionaLight.position.set( 45, 45, 45 );

		this.scene.add( directionaLight );

		this.scene.add( new AmbientLight( 0x404040, 1 ) );

		this.addGreenGround( this.scene );

		this.ground.visible = false;
	}

	ngAfterViewInit (): void {

		this.renderer = new WebGLRenderer( { alpha: true, antialias: true, precision: 'highp' } );

		this.renderer.setSize( WIDTH, HEIGHT );

	}

	ngOnDestroy (): void {

		if ( this.frameId != null ) {

			cancelAnimationFrame( this.frameId );

		}

	}

	resetCamera () {

		this.camera = new PerspectiveCamera( 50, WIDTH / HEIGHT, 0.1, 1000 );
		this.camera.position.z = 3;

	}

	// private render () {

	//     // this seems a faster want to call render function
	//     // requestAnimationFrame( this.render );

	//     // this.frameId = requestAnimationFrame( () => {
	//     //     this.render();
	//     // } );

	//     this.cube.rotation.x += 0.01;
	//     this.cube.rotation.y += 0.01;

	//     this.renderer.render( this.scene, this.camera );

	//     // console.log( this.scene.children.length );

	//     // this.controls.update();

	// }

	// setCanvasSize () {

	//     const container = this.renderer.domElement.parentElement.parentElement;

	//     const box = container.getBoundingClientRect();

	//     const width = container.clientWidth || 300;
	//     const height = 300; // container.clientHeight;

	//     this.renderer.setViewport( -box.left, -box.top, width, height );
	//     this.renderer.setSize( width, height );

	//     this.camera.aspect = width / height;
	//     this.camera.updateProjectionMatrix();

	// }

	getMaterialPreview ( material: Material ): string {

		if ( !material ) return;

		this.cube.visible = false;
		this.sphere.visible = true;

		this.cube.material = this.sphere.material = material;

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.cube.visible = this.sphere.visible = false;

		return image;
	}

	getSignPreview ( sign: TvRoadSign ): string {

		return '';

	}

	getModelPreview ( model: Object3D ): string {

		if ( !model ) return;

		this.cube.visible = this.sphere.visible = false;

		this.modelPreviewSetup( this.scene, this.camera, model );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( model );

		this.ground.visible = false;

		return image;
	}

	getRoadStylePreview ( roadStyle: RoadStyle ): string {

		this.camera.position.z = 20;

		this.cube.visible = this.sphere.visible = false;

		const gameObject = new GameObject();

		const road = new TvRoad( '', 0, 1, -1 );

		road.laneSections.push( roadStyle.laneSection );

		road.addGeometryLine( 0, -50, 0, 0, 100 );

		TvMapBuilder.buildRoad( gameObject, road );

		this.scene.add( gameObject );

		this.camera.position.z = road.getLeftSideWidth( 0 ) + road.getRightsideWidth( 0 );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( gameObject );

		return image;
	}

	getRoadMarkingPreview ( marking: TvRoadMarking ): string {

		this.camera.position.z = 20;

		this.sphere.visible = false;

		this.cube.visible = true;

		const texture = AssetDatabase.getInstance( marking.textureGuid ) as Texture;

		if ( !texture ) return;

		( this.cube.material as MeshBasicMaterial ).map = texture;

		( this.cube.material as MeshBasicMaterial ).map.needsUpdate = true;

		( this.cube.material as MeshBasicMaterial ).needsUpdate = true;

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.cube.visible = this.sphere.visible = false;

		return image;
	}


	modelPreviewSetup ( scene: Scene, camera: PerspectiveCamera, object: Object3D ) {

		scene.background = new Color( 0xcce0ff );

		scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

		object.position.set( 0, 0, 0 );

		scene.add( object );

		this.ground.visible = true;

		const box = new Box3().setFromObject( object );

		const size = box.getSize( new Vector3() ).length();

		const center = box.getCenter( new Vector3() );

		camera.position.set( 0, 1, size * 1 );

		camera.lookAt( object.position );

		camera.updateProjectionMatrix();
	}

	private addGreenGround ( scene ) {

		// ground
		this.groundTexture.wrapS = this.groundTexture.wrapT = THREE.RepeatWrapping;
		this.groundTexture.repeat.set( 1000, 1000 );
		this.groundTexture.anisotropy = 16;

		const groundMaterial = new MeshLambertMaterial( { map: this.groundTexture } );

		this.ground = new Mesh( new PlaneGeometry( 20000, 20000 ), groundMaterial );

		this.ground.position.y = 0;
		this.ground.rotation.x = -Math.PI / 2;
		this.ground.receiveShadow = true;

		scene.add( this.ground );
	}
}

