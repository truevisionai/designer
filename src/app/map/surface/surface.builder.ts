/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Surface } from './surface.model';
import { Mesh, MeshStandardMaterial, Object3D, Object3DEventMap, RepeatWrapping, Texture } from 'three';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/objects/game-object';
import { OdTextures } from '../builders/od.textures';
import { SurfaceGeometryBuilder } from 'app/services/surface/surface-geometry.builder';
import { MeshBuilder } from 'app/core/interfaces/mesh.builder';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceBuilder extends MeshBuilder<Surface> {

	constructor (
		private surfaceGeometryBuilder: SurfaceGeometryBuilder
	) {
		super();
	}

	build ( object: Surface ): Object3D {

		return this.buildSurface( object );

	}

	buildSurface ( surface: Surface ): Mesh {

		// update the surface if >=3 points are present
		if ( surface.spline.controlPoints.length < 2 ) {
			return;
		}

		const mesh = this.buildMesh( surface );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = Surface.tag;

		mesh.userData.surface = surface;

		return mesh;

	}

	buildMesh ( surface: Surface ): GameObject {

		const geometry = this.surfaceGeometryBuilder.createPolygon( surface.spline.controlPoints.map( cp => cp.position ) );

		const material = this.buildMaterial( surface );

		const mesh = new GameObject( 'surface:' + surface.uuid, geometry, material );

		return mesh;
	}

	buildMaterial ( surface: Surface ) {

		const texture = this.buildTexture( surface );

		let material: MeshStandardMaterial;

		if ( !surface.materialGuid || surface.materialGuid === 'grass' ) {

			material = new MeshStandardMaterial( { map: texture } );

		} else {

			material = AssetDatabase.getInstance<MeshStandardMaterial>( surface.materialGuid ).clone();

		}

		material.transparent = surface.transparent;

		material.opacity = surface.opacity;

		return material;

	}

	buildTexture ( surface: Surface ) {

		let texture: THREE.Texture;

		if ( surface.textureGuid === undefined ) {

			texture = OdTextures.terrain().clone();
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.anisotropy = 16;

		} else {

			texture = AssetDatabase.getInstance<Texture>( surface.textureGuid ).clone();

		}

		texture.rotation = surface.rotation;

		texture.offset.copy( surface.offset );

		texture.repeat.copy( surface.repeat );

		return texture;

	}

}
