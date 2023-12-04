import { Injectable } from '@angular/core';
import { TvSurface } from '../models/tv-surface.model';
import { ClampToEdgeWrapping, Mesh, MeshLambertMaterial, MeshStandardMaterial, Object3D, RepeatWrapping, Shape, ShapeGeometry, Texture, Vector2 } from 'three';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/core/game-object';
import { OdTextures } from './od.textures';

@Injectable( {
	providedIn: 'root'
} )
export class TvSurfaceBuilder {

	constructor () { }

	buildSurface ( surface: TvSurface ): Mesh {

		// update the surface if >=3 points are present
		if ( surface.spline.controlPoints.length < 2 ) {
			return;
		}

		const points: Vector2[] = surface.spline.controlPoints.map( cp => new Vector2( cp.position.x, cp.position.y ) );

		const shape = new Shape();

		shape.setFromPoints( points );

		// OLD CODE FOR SPLINE
		// const first = points.shift();
		// shape.moveTo( first.x, first.y );
		// shape.splineThru( points );

		const geometry = new ShapeGeometry( shape );

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

		let material: MeshStandardMaterial;

		if ( !surface.materialGuid || surface.materialGuid === 'grass' ) {

			material = new MeshStandardMaterial( { map: texture } );

		} else {

			material = AssetDatabase.getInstance<MeshStandardMaterial>( surface.materialGuid ).clone();

		}

		material.transparent = surface.transparent;

		material.opacity = surface.opacity;

		const mesh = new GameObject( 'surface:' + surface.uuid, geometry, material );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = TvSurface.tag;

		mesh.userData.surface = surface;

		return mesh;

	}

}
