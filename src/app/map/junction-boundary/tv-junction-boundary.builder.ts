/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	TvBoundarySegmentType,
	TvJointBoundary,
	TvJunctionBoundary,
	TvJunctionSegmentBoundary,
	TvLaneBoundary
} from './tv-junction-boundary';
import {
	BufferGeometry,
	Mesh,
	Shape,
	ShapeGeometry,
	Vector2,
	Vector3
} from 'three';
import { GeometryUtils } from 'app/services/surface/geometry-utils';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { JunctionUtils } from 'app/utils/junction.utils';
import { Log } from 'app/core/utils/log';
import { TvJunction } from '../models/junctions/tv-junction';
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { DelaunatorHelper } from 'app/services/surface/delaunay';
import { BoundaryPositionService } from './boundary-position.service';

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryBuilder {

	constructor ( private boundaryPositionService: BoundaryPositionService ) { }

	getBufferGeometry ( boundary: TvJunctionBoundary, via: 'shape' | 'delaunay' ): BufferGeometry {

		let geometry: BufferGeometry = null;

		if ( via == 'shape' ) {
			geometry = this.getShapeGeometry( boundary );
		} else if ( via == 'delaunay' ) {
			geometry = this.getDeluanayGeometry( boundary );
		}

		return geometry;
	}

	buildViaShape ( junction: TvJunction, boundary: TvJunctionBoundary ): Mesh {

		const geometry = this.getBufferGeometry( boundary, 'shape' );

		return JunctionOverlay.create( junction, geometry );

	}

	convertBoundaryToPositions ( boundary: TvJunctionBoundary ): Vector3[] {

		const positions: Vector3[] = [];

		boundary.segments.forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( pos => positions.push( pos ) );

		} );

		return positions

	}

	private getDeluanayGeometry ( boundary: TvJunctionBoundary ): BufferGeometry {

		return DelaunatorHelper.createFromPoints( this.convertBoundaryToPositions( boundary ) );

	}

	private getShapeGeometry ( boundary: TvJunctionBoundary ): ShapeGeometry {

		// const shape = this.convertBoundaryToShape( boundary );
		// const shape = this.convertBoundaryToShapeSimple( boundary );

		const points = this.convertBoundaryToPositions( boundary );

		if ( points.length < 3 ) {
			Log.error( 'Invalid boundary points', points.length );
			return new ShapeGeometry( new Shape() );
		}

		const shape = this.convertBoundaryToShapeSimple( boundary );
		// const shape = this.convertBoundaryToShapeComplex( boundary );

		return new ShapeGeometry( shape );
	}

	/**
	 * Useful for debugging the boundary
	 * @param boundary
	 */
	private debugDrawBoundary ( boundary: TvJunctionBoundary ) {

		let points = this.convertBoundaryToPositions( boundary );

		// Draw the
		points.forEach( ( p, index ) => {

			// Draw the point as a green sphere
			DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN );

			// Draw lines between consecutive points
			const nextIndex = ( index + 1 ) % points.length;

			DebugDrawService.instance.drawLine( [ p.clone(), points[ nextIndex ].clone() ], COLOR.BLUE, 1 );

		} );

		const center = GeometryUtils.getCentroid( points );

		DebugDrawService.instance.drawSphere( center.clone(), 1.0, COLOR.RED );

	}

	private createBoundaryPositions ( segment: TvJunctionSegmentBoundary ): Vector3[] {

		return this.boundaryPositionService.getSegmentPositions( segment );

	}

	private convertBoundaryToShapeComplex ( boundary: TvJunctionBoundary ) {

		// NOTE: THIS NOT WORKING PROPERLY

		const shape = new Shape();

		boundary.segments.forEach( ( segment, i ) => {

			const positions = this.createBoundaryPositions( segment );

			if ( i == 0 ) {
				shape.moveTo( positions[ 0 ].x, positions[ 0 ].y );
			}

			// DebugDrawService.instance.drawText( i.toString(), positions[ 0 ].clone().addScalar( 0.5 ) );

			Log.info( 'Segment', i, segment.toString() );

			if ( segment.type == TvBoundarySegmentType.JOINT ) {

				positions.forEach( pos => shape.lineTo( pos.x, pos.y ) );

			} else if ( segment.type == TvBoundarySegmentType.LANE ) {

				shape.splineThru( positions.map( pos => new Vector2( pos.x, pos.y ) ) );

			} else {

				Log.error( 'Unknown segment type', segment?.toString() );
			}

		} );

		return shape;
	}

	private convertBoundaryToShapeSimple ( boundary: TvJunctionBoundary ) {

		const positions = this.convertBoundaryToPositions( boundary );

		const points = positions.map( p => new Vector2( p.x, p.y ) );

		const shape = new Shape();

		const start = points[ 0 ];

		shape.moveTo( start.x, start.y );

		points.forEach( p => shape.lineTo( p.x, p.y ) );

		shape.closePath();

		return shape;
	}

}

