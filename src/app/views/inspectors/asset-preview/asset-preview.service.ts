/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/core/game-object';
import { IViewportController } from 'app/modules/three-js/objects/i-viewport-controller';
import { TvPrefab } from 'app/modules/three-js/objects/tv-prefab.model';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/marking-manager';
import { COLOR } from 'app/views/shared/utils/colors.service';
import * as THREE from 'three';
import {
	Box3,
	BoxGeometry,
	BufferGeometry, Camera,
	Color,
	Material,
	Mesh,
	MeshStandardMaterial,
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
import {
	AMBIENT_LIGHT_COLOR,
	DEFAULT_AMBIENT_LIGHT,
	DEFAULT_DIRECTIONAL_LIGHT,
	DIRECTIONAL_LIGHT_POSITION
} from 'app/modules/three-js/default.config';
import { RoadStyle } from "../../../core/asset/road.style";
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';

const WIDTH = 200;
const HEIGHT = 200;

@Injectable( {
	providedIn: 'root'
} )
export class AssetPreviewService {

	public renderer: WebGLRenderer;

	public frameId: number;

	public scene: Scene = new Scene;

	public camera: PerspectiveCamera;

	public controls: IViewportController;

	public ground: Mesh;

	private cube: Mesh;

	private sphere: Mesh;

	private plane: Mesh;

	private cubeMaterial = new MeshStandardMaterial( { color: 0x00ff00 } );

	private sphereMaterial = new MeshStandardMaterial( { color: 0x00ff00 } );

	private planeMaterial = new MeshStandardMaterial( { color: 0x00ff00 } );

	private groundTexture = new TextureLoader().load( 'assets/grass.jpg' );

	constructor () {

		this.ngOnInit();
		this.ngAfterViewInit();

	}

	ngOnInit () {

		this.createCube();

		this.createSphere();

		this.createPlane();

		this.resetCamera();

		this.createLights( this.scene );

		this.addGreenGround( this.scene );

		this.ground.visible = false;
	}

	createLights ( scene: Scene ) {

		const directionaLight = DEFAULT_DIRECTIONAL_LIGHT;

		directionaLight.position.copy( DIRECTIONAL_LIGHT_POSITION );

		scene.add( directionaLight.clone() );

		scene.add( new THREE.AmbientLight( AMBIENT_LIGHT_COLOR, 1 ) );

	}

	ngAfterViewInit (): void {

		this.renderer = new WebGLRenderer( { alpha: true, antialias: true, precision: 'highp', stencil: false } );

		this.renderer.setPixelRatio( window.devicePixelRatio );

		this.renderer.autoClear = true;

		this.renderer.setSize( WIDTH, HEIGHT );

	}

	ngOnDestroy (): void {

		if ( this.frameId != null ) {

			cancelAnimationFrame( this.frameId );

		}

	}

	resetCamera () {

		this.camera = new PerspectiveCamera( 50, WIDTH / HEIGHT, 0.1, 1000 );

		this.camera.position.set( 0, 0, 5 );

		this.camera.lookAt( 0, 0, 0 );

		this.camera.up.copy( AppConfig.DEFAULT_UP );

		this.camera.updateProjectionMatrix();

	}

	createCube () {

		const geometry = new BoxGeometry( 1, 1, 1 );

		this.cube = new Mesh( geometry, this.cubeMaterial );

		this.scene.add( this.cube );

		this.cube.visible = false;
	}

	createPlane () {

		const geometry = new PlaneGeometry( 10, 10 );

		this.plane = new Mesh( geometry, this.planeMaterial );

		this.scene.add( this.plane );

		this.plane.visible = false;
	}

	createSphere () {

		const geometry = new SphereGeometry( 1, 32, 32 );

		this.sphere = new Mesh( geometry, this.sphereMaterial );

		this.scene.add( this.sphere );

		this.sphere.visible = false;
	}

	updatePreview ( asset: AssetNode ) {

		if ( asset.type === AssetType.MATERIAL ) {

			const instance = AssetDatabase.getInstance<Material>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getMaterialPreview( instance );

		} else if ( asset.type === AssetType.ROAD_SIGN ) {

			const instance = AssetDatabase.getInstance<TvRoadSign>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getSignPreview( instance );

		} else if ( asset.type === AssetType.MODEL ) {

			const instance = AssetDatabase.getInstance<Object3D>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getModelPreview( instance );

		} else if ( asset.type === AssetType.PREFAB ) {

			const prefab = AssetDatabase.getInstance<TvPrefab>( asset.guid );

			asset.preview = this.getModelPreview( prefab );

		} else if ( asset.type === AssetType.ROAD_STYLE ) {

			const instance = AssetDatabase.getInstance<RoadStyle>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getRoadStylePreview( instance );

		} else if ( asset.type === AssetType.ROAD_MARKING ) {

			const instance = AssetDatabase.getInstance( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getRoadMarkingPreview( instance as TvRoadMarking );

		} else if ( asset.type === AssetType.GEOMETRY ) {

			const instance = AssetDatabase.getInstance<BufferGeometry>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getGeometryPreview( instance );

		} else if ( asset.type === AssetType.TEXTURE ) {

			const instance = AssetDatabase.getInstance<Texture>( asset.guid );

			if ( !instance ) return;

			asset.preview = this.getTexturePreview( instance );

		}

	}

	getGeometryPreview ( geometry: THREE.BufferGeometry ): any {

		if ( !geometry ) return;

		const model = new Mesh( geometry, new MeshStandardMaterial( { color: COLOR.GRAY, wireframe: true } ) );

		this.setupScene( AssetType.GEOMETRY, model, this.scene );

		this.setupCamera( AssetType.GEOMETRY, model, this.camera );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( model );

		this.resetScene();

		return image;

	}

	getMaterialPreview ( material: Material ): string {

		if ( !material ) return;

		this.camera.position.set( 0, 0, 4 );

		this.camera.updateProjectionMatrix();

		this.sphere.visible = true;

		this.sphere.material = material;

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.sphere.material = null;

		this.resetScene();

		return image;
	}

	resetScene () {

		this.cube.material = this.cubeMaterial;

		this.sphere.material = this.sphereMaterial;

		this.plane.material = this.planeMaterial;

		this.cube.visible = this.sphere.visible = this.plane.visible = false;

		this.ground.visible = false;

		this.scene.background = null;

		this.scene.fog = null;

		this.scene.remove( this.ground );

		this.resetCamera();

	}

	getSignPreview ( sign: TvRoadSign ): string {

		return '';

	}

	getModelPreview ( model: Object3D ): string {

		if ( !model ) return;

		this.setupScene( AssetType.MODEL, model, this.scene );

		this.setupCamera( AssetType.MODEL, model, this.camera );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( model );

		this.resetScene();

		return image;
	}

	getTexturePreview ( texture: THREE.Texture ): string {

		if ( !texture ) return;

		const material = new MeshStandardMaterial( { map: texture } );

		const aspect = texture.image.width / texture.image.height;

		const height = 10

		const width = height * aspect;

		const plane = new PlaneGeometry( width, height );

		var quad = new Mesh( plane, material );

		this.setupScene( AssetType.TEXTURE, quad, this.scene );

		this.setupCamera( AssetType.TEXTURE, quad, this.camera );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( quad );

		this.resetScene();

		return image;
	}

	getRoadStylePreview ( roadStyle: RoadStyle ): string {

		const object3d = this.getRoadStyleObject( roadStyle );

		this.setupScene( AssetType.ROAD_STYLE, object3d, this.scene );

		this.setupCamera( AssetType.ROAD_STYLE, object3d, this.camera );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( object3d );

		this.resetScene();

		return image;
	}

	getRoadStyleObject ( roadStyle: RoadStyle ): Object3D {

		const gameObject = new GameObject();

		const road = new TvRoad( '', 0, 1 );

		road.laneSections.push( roadStyle.laneSection );

		roadStyle.laneSection.road = road;

		road.addGeometryLine( 0, -250, 0, 0, 500 );

		TvMapBuilder.buildRoad( gameObject, road );

		return gameObject;
	}

	getRoadMarkingPreview ( marking: TvRoadMarking ): string {

		this.scene.add( marking.mesh );

		const box = new Box3().setFromObject( marking.mesh );
		const size = box.getSize( new Vector3() ).length();
		const center = box.getCenter( new Vector3() );

		this.camera.position.set( 0, 0, size );
		this.camera.lookAt( center );
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( WIDTH, HEIGHT );
		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( marking.mesh );

		this.resetScene();

		return image;
	}

	setupCamera ( assetType: AssetType, object: Object3D, camera: Camera ) {

		const box = new Box3().setFromObject( object );
		const size = box.getSize( new Vector3() );
		const center = box.getCenter( new Vector3() );

		switch ( assetType ) {

			case AssetType.MODEL:
				camera.position.set( center.x, size.y, size.z * 2 );
				break;

			case AssetType.ROAD_STYLE:
				const width = size.y;
				const length = size.x;
				camera.position.set( width * 0.5, width * 0.5, width * 0.5 );
				break;

			case AssetType.TEXTURE:
				camera.position.set( 0, 0, size.y > size.x ? size.y : size.x );
				break;

			default:
				camera.position.set( center.x, size.y, size.z * 2 );
				break;
		}

		camera.lookAt( center );

		if ( camera instanceof PerspectiveCamera ) {
			camera.updateProjectionMatrix();
		}

	}

	setupScene ( assetType: AssetType, object: Object3D, scene: Scene ) {

		object.position.set( 0, 0, 0 );

		scene.add( object );

		// for texture asset type, we don't need to setup scene
		if ( assetType == AssetType.TEXTURE ) return;

		scene.background = new Color( 0xcce0ff );

		scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

		scene.add( this.ground );

		this.ground.visible = true;

		if ( assetType == AssetType.ROAD_STYLE ) {

			this.ground.position.z = -0.2;

		} else {

			this.ground.position.z = 0;

		}

	}

	private addGreenGround ( scene ) {

		// ground
		this.groundTexture.wrapS = this.groundTexture.wrapT = THREE.RepeatWrapping;
		this.groundTexture.repeat.set( 1000, 1000 );
		this.groundTexture.anisotropy = 16;

		const groundMaterial = new THREE.MeshStandardMaterial( { map: this.groundTexture } );

		this.ground = new Mesh( new PlaneGeometry( 20000, 20000 ), groundMaterial );

		this.ground.position.z -= 0.1;

		this.ground.receiveShadow = true;

		scene.add( this.ground );
	}
}

