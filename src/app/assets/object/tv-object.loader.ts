/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/assets/asset-database';
import {
	AmbientLight, Bone,
	BufferGeometry,
	BufferGeometryLoader,
	Color,
	DirectionalLight,
	Fog,
	FogExp2,
	Group,
	HemisphereLight,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	InstancedMesh,
	LightProbe,
	Line,
	LineLoop,
	LineSegments,
	LOD,
	Material,
	Mesh,
	Object3D,
	ObjectLoader,
	OrthographicCamera,
	PerspectiveCamera,
	PointLight,
	Points,
	RectAreaLight,
	Scene,
	SkinnedMesh,
	SpotLight, Sprite
} from 'three';
import { TvStandardMaterial } from '../material/tv-standard-material';
import { TvObjectAsset } from './tv-object.asset';
import { TvMesh } from '../mesh/tv-mesh';
import { Injectable } from "@angular/core";
import { Asset } from "../../assets/asset.model";
import { StorageService } from "../../io/storage.service";
import { AssetLoader } from "../../core/interfaces/asset.loader";

@Injectable( {
	providedIn: 'root'
} )
export class TvObjectLoader implements AssetLoader {

	constructor (
		private storage: StorageService
	) {
	}

	load ( asset: Asset ): TvObjectAsset {

		const contents = this.storage.readSync( asset.path );

		const json = JSON.parse( contents );

		return this.loadObject( json );
	}

	// {
	// 	"version": "1.1",
	// 	"metadata":
	//  "guid": "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
	// 	"geometries": [],
	// 	"object":
	// }
	loadObject ( json: any ): TvObjectAsset {

		const materials = {};

		const geometries = this.parseGeometries( json.geometries );

		const textures = {};

		const animations = {};

		const instance = this.parseObject( json.object, geometries, materials, textures, animations );

		return new TvObjectAsset( json.object.uuid, instance );

	}

	private parseGeometries ( geometries ): any {

		const bufferGeometryLoader = new BufferGeometryLoader();

		const geometriesMap = {};

		for ( let i = 0; i < geometries.length; i++ ) {

			const data = geometries[ i ];

			let geometry: BufferGeometry | InstancedBufferGeometry;

			switch ( data.type ) {
				case 'BufferGeometry':
				case 'InstancedBufferGeometry':
					geometry = bufferGeometryLoader.parse( data );
					break;

				default:
					console.warn( `Unsupported geometry type "${ data.type }"` );

			}

			geometry.uuid = data.uuid;

			if ( data.name !== undefined ) geometry.name = data.name;
			if ( data.userData !== undefined ) geometry.userData = data.userData;

			geometriesMap[ data.uuid ] = geometry;

		}

		return geometriesMap;

	}

	private parseObject ( data, geometries, materials, textures, animations ): Object3D {

		let object;

		function getGeometry ( name ): BufferGeometry {

			if ( geometries[ name ] === undefined ) {

				console.warn( 'Undefined geometry', name );

			}

			return geometries[ name ];

		}

		function getMaterial ( name ): any {

			if ( name === undefined ) return undefined;

			if ( Array.isArray( name ) ) {

				const array: Material[] = [];

				for ( let i = 0, l = name.length; i < l; i++ ) {

					const uuid = name[ i ];

					if ( !AssetDatabase.has( uuid ) ) {

						console.warn( 'Undefined material', uuid );

					}

					array.push( AssetDatabase.getMaterial( uuid )?.material );

				}

				return array;

			}

			if ( !AssetDatabase.has( name ) ) {

				console.warn( 'Undefined material', name );

			}

			return AssetDatabase.getMaterial( name )?.material;

		}

		function getTexture ( uuid ): any {

			if ( textures[ uuid ] === undefined ) {

				console.warn( 'Undefined texture', uuid );

			}

			return textures[ uuid ];

		}

		let geometry: BufferGeometry, material: Material | Material[];

		switch ( data.type ) {

			case 'Scene':

				object = new Scene();

				if ( data.background !== undefined ) {

					if ( Number.isInteger( data.background ) ) {

						object.background = new Color( data.background );

					} else {

						object.background = getTexture( data.background );

					}

				}

				if ( data.environment !== undefined ) {

					object.environment = getTexture( data.environment );

				}

				if ( data.fog !== undefined ) {

					if ( data.fog.type === 'Fog' ) {

						object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far );

					} else if ( data.fog.type === 'FogExp2' ) {

						object.fog = new FogExp2( data.fog.color, data.fog.density );

					}

					if ( data.fog.name !== '' ) {

						object.fog.name = data.fog.name;

					}

				}

				if ( data.backgroundBlurriness !== undefined ) object.backgroundBlurriness = data.backgroundBlurriness;
				if ( data.backgroundIntensity !== undefined ) object.backgroundIntensity = data.backgroundIntensity;
				if ( data.backgroundRotation !== undefined ) object.backgroundRotation.fromArray( data.backgroundRotation );

				if ( data.environmentIntensity !== undefined ) object.environmentIntensity = data.environmentIntensity;
				if ( data.environmentRotation !== undefined ) object.environmentRotation.fromArray( data.environmentRotation );

				break;

			case 'PerspectiveCamera':

				object = new PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

				if ( data.focus !== undefined ) object.focus = data.focus;
				if ( data.zoom !== undefined ) object.zoom = data.zoom;
				if ( data.filmGauge !== undefined ) object.filmGauge = data.filmGauge;
				if ( data.filmOffset !== undefined ) object.filmOffset = data.filmOffset;
				if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

				break;

			case 'OrthographicCamera':

				object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

				if ( data.zoom !== undefined ) object.zoom = data.zoom;
				if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

				break;

			case 'AmbientLight':

				object = new AmbientLight( data.color, data.intensity );

				break;

			case 'DirectionalLight':

				object = new DirectionalLight( data.color, data.intensity );

				break;

			case 'PointLight':

				object = new PointLight( data.color, data.intensity, data.distance, data.decay );

				break;

			case 'RectAreaLight':

				object = new RectAreaLight( data.color, data.intensity, data.width, data.height );

				break;

			case 'SpotLight':

				object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );

				break;

			case 'HemisphereLight':

				object = new HemisphereLight( data.color, data.groundColor, data.intensity );

				break;

			case 'LightProbe':

				object = new LightProbe().fromJSON( data );

				break;

			case 'SkinnedMesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );

				object = new SkinnedMesh( geometry, material );

				if ( data.bindMode !== undefined ) object.bindMode = data.bindMode;
				if ( data.bindMatrix !== undefined ) object.bindMatrix.fromArray( data.bindMatrix );
				if ( data.skeleton !== undefined ) object.skeleton = data.skeleton;

				break;

			case 'Mesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );

				object = new TvMesh( data.uuid, data.name, geometry, material );

				break;

			case 'InstancedMesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );
				const count = data.count;
				const instanceMatrix = data.instanceMatrix;
				const instanceColor = data.instanceColor;

				object = new InstancedMesh( geometry, material, count );
				object.instanceMatrix = new InstancedBufferAttribute( new Float32Array( instanceMatrix.array ), 16 );
				if ( instanceColor !== undefined ) object.instanceColor = new InstancedBufferAttribute( new Float32Array( instanceColor.array ), instanceColor.itemSize );

				break;

			case 'LOD':

				object = new LOD();

				break;

			case 'Line':

				object = new Line( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'LineLoop':

				object = new LineLoop( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'LineSegments':

				object = new LineSegments( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'PointCloud':
			case 'Points':

				object = new Points( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'Sprite':

				// object = new Sprite( getMaterial( data.material ) );

				break;

			case 'Group':

				object = new Group();

				break;

			case 'Bone':

				object = new Bone();

				break;

			default:

				object = new Object3D();

		}

		object.uuid = data.uuid;

		if ( data.name !== undefined ) object.name = data.name;

		if ( data.matrix !== undefined ) {

			object.matrix.fromArray( data.matrix );

			if ( data.matrixAutoUpdate !== undefined ) object.matrixAutoUpdate = data.matrixAutoUpdate;
			if ( object.matrixAutoUpdate ) object.matrix.decompose( object.position, object.quaternion, object.scale );

		} else {

			if ( data.position !== undefined ) object.position.fromArray( data.position );
			if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
			if ( data.quaternion !== undefined ) object.quaternion.fromArray( data.quaternion );
			if ( data.scale !== undefined ) object.scale.fromArray( data.scale );

		}

		if ( data.up !== undefined ) object.up.fromArray( data.up );

		if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
		if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

		if ( data.shadow ) {

			if ( data.shadow.bias !== undefined ) object.shadow.bias = data.shadow.bias;
			if ( data.shadow.normalBias !== undefined ) object.shadow.normalBias = data.shadow.normalBias;
			if ( data.shadow.radius !== undefined ) object.shadow.radius = data.shadow.radius;
			if ( data.shadow.mapSize !== undefined ) object.shadow.mapSize.fromArray( data.shadow.mapSize );

		}

		if ( data.visible !== undefined ) object.visible = data.visible;
		if ( data.frustumCulled !== undefined ) object.frustumCulled = data.frustumCulled;
		if ( data.renderOrder !== undefined ) object.renderOrder = data.renderOrder;
		if ( data.userData !== undefined ) object.userData = data.userData;
		if ( data.layers !== undefined ) object.layers.mask = data.layers;

		if ( data.children !== undefined ) {

			const children = data.children;

			for ( let i = 0; i < children.length; i++ ) {

				object.add( this.parseObject( children[ i ], geometries, materials, textures, animations ) );

			}

		}

		if ( data.animations !== undefined ) {

			const objectAnimations = data.animations;

			for ( let i = 0; i < objectAnimations.length; i++ ) {

				const uuid = objectAnimations[ i ];

				object.animations.push( animations[ uuid ] );

			}

		}

		if ( data.type === 'LOD' ) {

			if ( data.autoUpdate !== undefined ) object.autoUpdate = data.autoUpdate;

			const levels = data.levels;

			for ( let l = 0; l < levels.length; l++ ) {

				const level = levels[ l ];
				const child = object.getObjectByProperty( 'uuid', level.object );

				if ( child !== undefined ) {

					object.addLevel( child, level.distance, level.hysteresis );

				}

			}

		}

		return object;

	}
}
