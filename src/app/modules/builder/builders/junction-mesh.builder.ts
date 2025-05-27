/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	BufferGeometry,
	CubicBezierCurve,
	DoubleSide,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	RepeatWrapping,
	Shape,
	ShapeGeometry,
	Texture,
	Vector2,
} from "three";
import { OdTextures } from 'app/deprecated/od.textures';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMaterialService } from 'app/assets/material/tv-material.service';
import { MeshBuilder } from 'app/core/builders/mesh.builder';
import { JunctionBoundaryBuilder } from './junction-boundary.builder';
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';
import { TvJointBoundary } from 'app/map/junction-boundary/tv-joint-boundary';
import { SplineFactory } from 'app/services/spline/spline.factory';

const ASPHALT_GUID = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

export function createGeometryFromBoundaryJoints ( boundary: TvJunctionBoundary ): BufferGeometry {

	const outline = getOutlineFromJointBoundary( boundary );

	const shape = new Shape( outline.map( p => new Vector2( p.x, p.y ) ) );

	const geometry = new ShapeGeometry( shape );

	return geometry;

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

		const outline = getOutlineFromJointBoundary( junction.getBoundary() );

		const shape = new Shape( outline.map( p => new Vector2( p.x, p.y ) ) );

		const geometry = new ShapeGeometry( shape );

		return geometry;

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

function getOutlineFromJointBoundary ( boundary: TvJunctionBoundary ): Vector2[] {

	const outline: Vector2[] = [];

	const jointSegments = boundary.getSegments().filter( s => s.isJointSegment );

	for ( let i = 0; i < jointSegments.length; i++ ) {

		const segA = jointSegments[ i ] as TvJointBoundary;
		let segB = jointSegments[ i + 1 ] as TvJointBoundary | undefined;

		const startCoord = segA.getStartLaneCoord();
		const endCoord = segA.getEndLaneCoord();

		const pStart = startCoord.getEntryPosition().toVector2();
		outline.push( pStart );

		const pEnd = endCoord.getExitPosition().toVector2();
		outline.push( pEnd );

		if ( !segB ) {
			segB = jointSegments[ 0 ] as TvJointBoundary;
		}

		getSmoothSplineCurvePoints( segA, segB ).forEach( p => {
			outline.push( p );
		} );
	}

	return outline;

}

function getSmoothBezierCurvePoints ( segA: TvJointBoundary, segB: TvJointBoundary ): Vector2[] {

	const outline: Vector2[] = [];
	const divider = 2;
	const entry = segA.getEndLaneCoord();
	const exit = segB.getStartLaneCoord();

	const entryPosition = entry.getExitPosition().toVector3()
	const exitPosition = exit.getEntryPosition().toVector3();

	const entryDirection = entry.getHeadingVector().normalize();
	const exitDirection = exit.getHeadingVector().normalize();

	if ( entry.isStart ) entryDirection.negate();
	if ( exit.isStart ) exitDirection.negate();

	const distance = entryPosition.distanceTo( exitPosition );

	// v2 and v3 are the control points
	const v2 = entryPosition.clone().add( entryDirection.multiplyScalar( distance / divider ) );
	const v3 = exitPosition.clone().add( exitDirection.multiplyScalar( distance / divider ) );

	const bezier = new CubicBezierCurve(
		new Vector2( entryPosition.x, entryPosition.y ),
		new Vector2( v2.x, v2.y ),
		new Vector2( v3.x, v3.y ),
		new Vector2( exitPosition.x, exitPosition.y )
	);

	bezier.getPoints( 20 ).forEach( p => {
		outline.push( new Vector2( p.x, p.y ) );
	} );

	return outline;
}

function getSmoothSplineCurvePoints ( segA: TvJointBoundary, segB: TvJointBoundary ): Vector2[] {

	const outline: Vector2[] = [];
	const entry = segA.getEndLaneCoord();
	const exit = segB.getStartLaneCoord();

	const entryPosition = entry.getExitPosition().toVector3()
	const exitPosition = exit.getEntryPosition().toVector3();

	const entryDirection = entry.getHeadingVector().normalize();
	const exitDirection = exit.getHeadingVector().normalize();

	if ( entry.isStart ) entryDirection.negate();
	if ( exit.isStart ) exitDirection.negate();

	const spline = SplineFactory.createRoadSpline( entryPosition, entryDirection, exitPosition, exitDirection );

	spline.updateSegmentGeometryAndBounds();

	spline.getPoints( 0.1 ).forEach( p => {
		outline.push( new Vector2( p.x, p.y ) );
	} );

	return outline;
}
