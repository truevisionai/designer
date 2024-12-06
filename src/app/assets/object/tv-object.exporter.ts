/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Material } from "three";
import { TvStandardMaterial } from "../material/tv-standard-material";
import { TvObjectAsset } from "./tv-object.asset";
import { AssetExporter } from "../../core/interfaces/asset-exporter";

@Injectable( {
	providedIn: 'root'
} )
export class TvObjectExporter implements AssetExporter<any> {

	constructor () {
	}

	exportAsString ( objectAsset: TvObjectAsset ): string {

		const output = this.exportAsJSON( objectAsset.instance );

		const json = {
			version: '1.1',
			guid: objectAsset.guid,
			metadata: output.metadata,
			geometries: output.geometries,
			object: output.object,
		};

		return JSON.stringify( json, null, 2 );
	}

	exportAsJSON ( instance: any, meta?: any ): any {

		// meta is a string when called from JSON.stringify
		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		const output: any = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {},
				nodes: {}
			};

			output.metadata = {
				version: 4.6,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		const object: any = {};

		object.uuid = instance.uuid;
		object.type = instance.type;

		if ( instance.name !== '' ) object.name = instance.name;
		if ( instance.castShadow === true ) object.castShadow = true;
		if ( instance.receiveShadow === true ) object.receiveShadow = true;
		if ( instance.visible === false ) object.visible = false;
		if ( instance.frustumCulled === false ) object.frustumCulled = false;
		if ( instance.renderOrder !== 0 ) object.renderOrder = instance.renderOrder;
		if ( Object.keys( instance.userData ).length > 0 ) object.userData = instance.userData;

		object.layers = instance.layers.mask;
		object.matrix = instance.matrix.toArray();
		object.up = instance.up.toArray();

		if ( instance.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( instance.isInstancedMesh ) {

			object.type = 'InstancedMesh';
			object.count = instance.count;
			object.instanceMatrix = instance.instanceMatrix.toJSON();
			if ( instance.instanceColor !== null ) object.instanceColor = instance.instanceColor.toJSON();

		}

		if ( instance.isBatchedMesh ) {

			object.type = 'BatchedMesh';
			object.perObjectFrustumCulled = instance.perObjectFrustumCulled;
			object.sortObjects = instance.sortObjects;

			object.drawRanges = instance._drawRanges;
			object.reservedRanges = instance._reservedRanges;

			object.visibility = instance._visibility;
			object.active = instance._active;
			object.bounds = instance._bounds.map( bound => ( {
				boxInitialized: bound.boxInitialized,
				boxMin: bound.box.min.toArray(),
				boxMax: bound.box.max.toArray(),

				sphereInitialized: bound.sphereInitialized,
				sphereRadius: bound.sphere.radius,
				sphereCenter: bound.sphere.center.toArray()
			} ) );

			object.maxGeometryCount = instance._maxGeometryCount;
			object.maxVertexCount = instance._maxVertexCount;
			object.maxIndexCount = instance._maxIndexCount;

			object.geometryInitialized = instance._geometryInitialized;
			object.geometryCount = instance._geometryCount;

			object.matricesTexture = instance._matricesTexture.toJSON( meta );

			if ( instance.boundingSphere !== null ) {

				object.boundingSphere = {
					center: object.boundingSphere.center.toArray(),
					radius: object.boundingSphere.radius
				};

			}

			if ( instance.boundingBox !== null ) {

				object.boundingBox = {
					min: object.boundingBox.min.toArray(),
					max: object.boundingBox.max.toArray()
				};

			}

		}

		//

		function serialize ( library: any, element: any ): any {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( instance.isScene ) {

			if ( instance.background ) {

				if ( instance.background.isColor ) {

					object.background = instance.background.toJSON();

				} else if ( instance.background.isTexture ) {

					object.background = instance.background.toJSON( meta ).uuid;

				}

			}

			if ( instance.environment && instance.environment.isTexture && instance.environment.isRenderTargetTexture !== true ) {

				object.environment = instance.environment.toJSON( meta ).uuid;

			}

		} else if ( instance.isMesh || instance.isLine || instance.isPoints ) {

			object.geometry = serialize( meta.geometries, instance.geometry );

			const parameters = instance.geometry.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				const shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( let i = 0, l = shapes.length; i < l; i++ ) {

						const shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( instance.isSkinnedMesh ) {

			object.bindMode = instance.bindMode;
			object.bindMatrix = instance.bindMatrix.toArray();

			if ( instance.skeleton !== undefined ) {

				serialize( meta.skeletons, instance.skeleton );

				object.skeleton = instance.skeleton.uuid;

			}

		}

		if ( instance.material !== undefined ) {

			function serializeMaterial ( material: Material | TvStandardMaterial ): any {

				if ( material instanceof TvStandardMaterial ) {

					return material.guid || material.userData.guid;

				} else if ( material instanceof Material ) {

					return material.userData.guid || material.uuid;

				} else {

					console.error( 'TvObjectExporter: Material is not an instance of Material or TvMaterial' );
					return null;
				}

			}

			if ( Array.isArray( instance.material ) ) {

				const guids = [];

				for ( let i = 0, l = instance.material.length; i < l; i++ ) {

					guids.push( serializeMaterial( instance.material[ i ] ) );

				}

				object.material = guids;

			} else {

				object.material = serializeMaterial( instance.material );

			}

		}

		//

		if ( instance.children.length > 0 ) {

			object.children = [];

			for ( let i = 0; i < instance.children.length; i++ ) {

				// object.children.push( instance.children[ i ].toJSON( meta ).object );
				object.children.push( this.exportAsJSON( instance.children[ i ], meta ).object );

			}

		}

		//

		if ( instance.animations.length > 0 ) {

			object.animations = [];

			for ( let i = 0; i < instance.animations.length; i++ ) {

				const animation = instance.animations[ i ];

				object.animations.push( serialize( meta.animations, animation ) );

			}

		}

		if ( isRootObject ) {

			const geometries = extractFromCache( meta.geometries );
			// const materials = extractFromCache( meta.materials );
			// const textures = extractFromCache( meta.textures );
			// const images = extractFromCache( meta.images );
			// const shapes = extractFromCache( meta.shapes );
			// const skeletons = extractFromCache( meta.skeletons );
			// const animations = extractFromCache( meta.animations );
			// const nodes = extractFromCache( meta.nodes );

			if ( geometries.length > 0 ) output.geometries = geometries;
			//if ( materials.length > 0 ) output.materials = materials;
			//if ( textures.length > 0 ) output.textures = textures;
			//if ( images.length > 0 ) output.images = images;
			//if ( shapes.length > 0 ) output.shapes = shapes;
			//if ( skeletons.length > 0 ) output.skeletons = skeletons;
			//if ( animations.length > 0 ) output.animations = animations;
			//if ( nodes.length > 0 ) output.nodes = nodes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache ( cache: any ): any[] {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}
}
