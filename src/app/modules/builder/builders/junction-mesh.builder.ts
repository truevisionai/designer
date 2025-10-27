/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	BufferGeometry,
	DoubleSide,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	RepeatWrapping,
	Texture,
	Vector3,
} from "three";
import { OdTextures } from 'app/deprecated/od.textures';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMaterialService } from 'app/assets/material/tv-material.service';
import { MeshBuilder } from 'app/core/builders/mesh.builder';
import { JunctionBoundaryBuilder } from './junction-boundary.builder';
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';
import { TvJointBoundary } from 'app/map/junction-boundary/tv-joint-boundary';
import { TvLaneBoundary } from 'app/map/junction-boundary/tv-lane-boundary';
import { DelaunatorHelper } from 'app/services/surface/delaunay';

const ASPHALT_GUID = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

export function createGeometryFromBoundaryJoints ( boundary: TvJunctionBoundary ): BufferGeometry {

	const outline = getBoundaryPointsWithElevation( boundary );

	if ( outline.length < 3 ) {
		return new BufferGeometry();
	}

	return DelaunatorHelper.createFromPoints( outline );

}

@Injectable( {
	providedIn: 'root'
} )
export class JunctionMeshBuilder implements MeshBuilder<TvJunction> {

	constructor (
		private boundaryBuilder: JunctionBoundaryBuilder,
		private materialService: TvMaterialService,
	) {
	}

	build ( junction: TvJunction ): Object3D {

		const geometry = this.getJunctionOutlineGeometry( junction );

		return new Mesh( geometry, this.junctionMaterial );

	}

	/**
	 * NOTE: old boundary builder code for reference
	 * @param junction
	 * @returns
	 */
	getJunctionGeometry ( junction: TvJunction ): BufferGeometry {

		return this.boundaryBuilder.getBufferGeometry( junction.outerBoundary, 'delaunay' );

	}

	getJunctionOutlineGeometry ( junction: TvJunction ): BufferGeometry {

		const outline = getBoundaryPointsWithElevation( junction.getBoundary() );

		if ( outline.length < 3 ) {
			return new BufferGeometry();
		}

		return DelaunatorHelper.createFromPoints( outline );

	}

	private getJunctionTexture (): Texture {

		// Clone the texture and set wrapping to repeat
		const map = OdTextures.asphalt().clone();

		map.wrapS = map.wrapT = RepeatWrapping;

		return map;

	}

	private get junctionMaterial (): Material {

		const asphalt = this.materialService.getMaterial( ASPHALT_GUID )

		if ( asphalt ) {
			return asphalt.material;
		}

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: DoubleSide } );
	}

}

const OUTLINE_EPSILON = 1e-4;

function getBoundaryPointsWithElevation ( boundary: TvJunctionBoundary ): Vector3[] {

	const outline: Vector3[] = [];

	const segments = boundary.getSegments();

	for ( const segment of segments ) {

		let points: Vector3[];

		if ( segment instanceof TvJointBoundary ) {

			points = segment.getInnerPoints().map( p => p.toVector3() );

		} else if ( segment instanceof TvLaneBoundary ) {

			points = segment.getInnerPoints( 0.5 ).map( p => p.toVector3() );

		} else {

			points = segment.getPoints().map( p => p.toVector3() );

		}

		appendUniquePoints( outline, points );
	}

	closeIfLooped( outline );

	return outline;

}

function appendUniquePoints ( outline: Vector3[], points: Vector3[] ): void {

	for ( const point of points ) {

		if ( !point ) continue;

		if ( outline.length === 0 ) {
			outline.push( point );
			continue;
		}

		const last = outline[ outline.length - 1 ];

		if ( last.distanceToSquared( point ) <= OUTLINE_EPSILON * OUTLINE_EPSILON ) {
			continue;
		}

		outline.push( point );
	}

}

function closeIfLooped ( outline: Vector3[] ): void {

	if ( outline.length < 3 ) return;

	const first = outline[ 0 ];
	const last = outline[ outline.length - 1 ];

	if ( first.distanceToSquared( last ) <= OUTLINE_EPSILON * OUTLINE_EPSILON ) {
		outline.pop();
	}
}
