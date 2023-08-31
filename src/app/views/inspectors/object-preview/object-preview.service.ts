/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { GameObject } from 'app/core/game-object';
import { Metadata, MetaImporter } from 'app/core/models/metadata.model';
import { IViewportController } from 'app/modules/three-js/objects/i-viewport-controller';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
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
import { TvPrefab } from 'app/modules/three-js/objects/tv-prefab.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { AppConfig } from 'app/app.config';

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
	private plane: Mesh;

	private cubeMaterial = new MeshBasicMaterial( { color: 0x00ff00 } );
	private sphereMaterial = new MeshBasicMaterial( { color: 0x00ff00 } );
	private planeMaterial = new MeshBasicMaterial( { color: 0x00ff00 } );

	private groundTexture = new TextureLoader().load( 'assets/grass.jpg' );

	constructor ( private assetService: AssetLoaderService ) {

		this.ngOnInit();
		this.ngAfterViewInit();

	}

	ngOnInit () {

		this.createCube();

		this.createSphere();

		this.createPlane();

		this.resetCamera();

		this.createLights();

		this.addGreenGround( this.scene );

		this.ground.visible = false;
	}

	createLights () {

		const directionaLight = new DirectionalLight( 0xffffff, 1 );

		directionaLight.position.set( 5, 10, 7.5 );

		this.scene.add( directionaLight );

		this.scene.add( directionaLight.target );

		const ambientLight = new AmbientLight( 0xE6E6E6, 1 );

		this.scene.add( ambientLight );

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

		this.camera.position.set( 0, 0, 5 );

		this.camera.lookAt( 0, 0, 0 );

		this.camera.up.copy( AppConfig.DEFAULT_UP )

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

		const geometry = new SphereGeometry( 1, 32, 32 )

		this.sphere = new Mesh( geometry, this.sphereMaterial );

		this.scene.add( this.sphere );

		this.sphere.visible = false;
	}

	updatePreview ( metadata: Metadata ) {

		if ( metadata.importer === MetaImporter.MATERIAL ) {

			const instance = AssetDatabase.getInstance( metadata.guid );

			if ( !instance ) return;

			metadata.preview = this.getMaterialPreview( instance as Material );

		} else if ( metadata.importer === MetaImporter.SIGN ) {

			const instance = AssetDatabase.getInstance( metadata.guid );

			if ( !instance ) return;

			metadata.preview = this.getSignPreview( instance as TvRoadSign );

		} else if ( metadata.importer === MetaImporter.MODEL ) {

			this.assetService.modelImporterService.load( metadata.path, ( obj ) => {

				metadata.preview = this.getModelPreview( obj );

				AssetDatabase.setInstance( metadata.guid, obj );

			}, metadata );

		} else if ( metadata.importer === MetaImporter.PREFAB ) {

			const prefab = AssetDatabase.getInstance<TvPrefab>( metadata.guid );

			metadata.preview = this.getModelPreview( prefab );

			AssetDatabase.setInstance( metadata.guid, prefab );

		} else if ( metadata.importer === MetaImporter.ROAD_STYLE ) {

			const instance = AssetDatabase.getInstance( metadata.guid );

			if ( !instance ) return;

			metadata.preview = this.getRoadStylePreview( instance as RoadStyle );

		} else if ( metadata.importer === MetaImporter.ROAD_MARKING ) {

			const instance = AssetDatabase.getInstance( metadata.guid );

			if ( !instance ) return;

			metadata.preview = this.getRoadMarkingPreview( instance as TvRoadMarking );

		} else if ( metadata.importer === MetaImporter.GEOMETRY ) {

			const instance = AssetDatabase.getInstance( metadata.guid );

			if ( !instance ) return;

			metadata.preview = this.getGeometryPreview( instance as THREE.BufferGeometry );

		}

	}

	getGeometryPreview ( geometry: THREE.BufferGeometry ): any {

		if ( !geometry ) return;

		const model = new Mesh( geometry, new MeshBasicMaterial( { color: COLOR.GRAY, wireframe: true } ) );

		this.modelPreviewSetup( this.scene, this.camera, model );

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

		this.resetCamera();

	}

	getSignPreview ( sign: TvRoadSign ): string {

		return '';

	}

	getModelPreview ( model: Object3D ): string {

		if ( !model ) return;

		this.modelPreviewSetup( this.scene, this.camera, model );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( model );

		this.resetScene();

		return image;
	}

	getRoadStylePreview ( roadStyle: RoadStyle ): string {

		this.camera.position.z = 20;

		const gameObject = new GameObject();

		const road = new TvRoad( '', 0, 1, -1 );

		road.laneSections.push( roadStyle.laneSection );

		roadStyle.laneSection.road = road;

		road.addGeometryLine( 0, -50, 0, 0, 100 );

		TvMapBuilder.buildRoad( gameObject, road );

		this.scene.add( gameObject );

		this.camera.position.z = road.getLeftSideWidth( 0 ) + road.getRightsideWidth( 0 );

		this.renderer.setSize( WIDTH, HEIGHT );

		this.renderer.render( this.scene, this.camera );

		const image = this.renderer.domElement.toDataURL();

		this.scene.remove( gameObject );

		this.resetScene();

		return image;
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

	modelPreviewSetup ( scene: Scene, camera: PerspectiveCamera, object: Object3D ) {

		scene.background = new Color( 0xcce0ff );

		scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

		object.position.set( 0, 0, 0 );

		scene.add( object );

		this.ground.visible = true;

		const box = new Box3().setFromObject( object );

		const size = box.getSize( new Vector3() );

		const center = box.getCenter( new Vector3() );

		// Set the object's Y position to be half its height
		object.position.z = size.z / 2;

		camera.position.set( center.x, size.y, size.z * 2 );

		camera.lookAt( center );

		camera.updateProjectionMatrix();
	}

	private addGreenGround ( scene ) {

		// ground
		this.groundTexture.wrapS = this.groundTexture.wrapT = THREE.RepeatWrapping;
		this.groundTexture.repeat.set( 1000, 1000 );
		this.groundTexture.anisotropy = 16;

		const groundMaterial = new MeshLambertMaterial( { map: this.groundTexture } );

		this.ground = new Mesh( new PlaneGeometry( 20000, 20000 ), groundMaterial );

		this.ground.receiveShadow = true;

		scene.add( this.ground );
	}
}

