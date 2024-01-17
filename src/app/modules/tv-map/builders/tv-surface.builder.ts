import { Injectable } from '@angular/core';
import { TvSurface } from '../models/tv-surface.model';
import { Mesh, MeshStandardMaterial, RepeatWrapping, Texture } from 'three';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/core/game-object';
import { OdTextures } from './od.textures';
import { SurfaceGeometryBuilder } from 'app/services/surface/surface-geometry.builder';

@Injectable( {
	providedIn: 'root'
} )
export class TvSurfaceBuilder {

	constructor (
		private surfaceGeometryBuilder: SurfaceGeometryBuilder
	) { }

	buildSurface ( surface: TvSurface ): Mesh {

		// update the surface if >=3 points are present
		if ( surface.spline.controlPoints.length < 2 ) {
			return;
		}

		const mesh = this.buildMesh( surface );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = TvSurface.tag;

		mesh.userData.surface = surface;

		return mesh;

	}

	buildMesh ( surface: TvSurface ): GameObject {

		const geometry = this.surfaceGeometryBuilder.createPolygon( surface.spline.controlPoints.map( cp => cp.position ) );

		const material = this.buildMaterial( surface );

		const mesh = new GameObject( 'surface:' + surface.uuid, geometry, material );

		return mesh;
	}

	buildMaterial ( surface: TvSurface ) {

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

	buildTexture ( surface: TvSurface ) {

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
