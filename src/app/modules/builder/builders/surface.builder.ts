/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Surface } from '../../../map/surface/surface.model';
import { Material, Mesh, MeshStandardMaterial, Object3D, RepeatWrapping } from 'three';
import { GameObject } from 'app/objects/game-object';
import { OdTextures } from '../../../deprecated/od.textures';
import { SurfaceGeometryBuilder } from 'app/services/surface/surface-geometry.builder';
import { MeshBuilder } from 'app/core/builders/mesh.builder';
import { TvMaterialService } from 'app/assets/material/tv-material.service';
import { TvTexture } from 'app/assets/texture/tv-texture.model';
import { TvTextureService } from 'app/assets/texture/tv-texture.service';
import { Log } from 'app/core/utils/log';

@Injectable()
export class SurfaceBuilder extends MeshBuilder<Surface> {

	constructor (
		private surfaceGeometryBuilder: SurfaceGeometryBuilder,
		private materialService: TvMaterialService,
		private textureService: TvTextureService,
	) {
		super();
	}

	build ( object: Surface ): Object3D {

		return this.buildSurface( object );

	}

	private buildSurface ( surface: Surface ): Mesh {

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

	private buildMesh ( surface: Surface ): GameObject {

		const geometry = this.surfaceGeometryBuilder.createPolygon( surface.spline.controlPoints.map( cp => cp.position ) );

		const material = this.buildMaterial( surface );

		return new GameObject( 'surface:' + surface.uuid, geometry, material );
	}

	private buildMaterial ( surface: Surface ): Material {

		const texture = this.buildTexture( surface );

		let material: Material;

		if ( !surface.materialGuid || surface.materialGuid === 'grass' ) {

			material = new MeshStandardMaterial( { map: texture } );

		} else {

			material = this.materialService.getMaterial( surface.materialGuid ).material.clone();

		}

		material.transparent = surface.transparent;

		material.opacity = surface.opacity;

		return material;

	}

	private buildTexture ( surface: Surface ): TvTexture {

		let texture: TvTexture;

		if ( surface.textureGuid === undefined ) {

			texture = OdTextures.terrain().clone();
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.anisotropy = 16;

		} else {

			try {

				texture = this.textureService.getTexture( surface.textureGuid ).texture.clone();

			} catch ( error ) {

				Log.error( error );

				texture = OdTextures.terrain().clone();

			}

		}

		texture.rotation = surface.rotation;

		texture.offset.copy( surface.offset );

		texture.repeat.copy( surface.repeat );

		return texture;

	}

}
