/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvSpiralGeometry } from 'app/modules/tv-map/models/geometries/tv-spiral-geometry';
import { Object3D, Vector2, Vector3 } from 'three';
import { TvMapBuilder } from '../../modules/tv-map/builders/od-builder.service';
import { TvAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from '../../modules/tv-map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from '../../modules/tv-map/models/geometries/tv-line-geometry';
import { TvSide } from '../../modules/tv-map/models/tv-common';
import { TvMap } from '../../modules/tv-map/models/tv-map.model';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { Maths } from '../../utils/maths';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { SceneService } from '../services/scene.service';

export class RoadPlanHelper {

	constructor ( private shapeEditor: AbstractShapeEditor ) {

	}

	setControlPointUserData ( object: Object3D, roadId, geometry, index ): void {

		object.userData.roadId = roadId;
		object.userData.geometry = geometry;
		object.userData.index = index;

	}

	createRoadControlPoints ( map: TvMap ): void {

		// create control points for all geometries
		map.roads.forEach( road => {

			road.geometries.forEach( geometry => {

				// if line
				if ( geometry instanceof TvLineGeometry ) {

					const start = this.shapeEditor.addControlPoint( geometry.startV3 );
					const end = this.shapeEditor.addControlPoint( geometry.endV3 );

					this.setControlPointUserData( start, road.id, geometry, 0 );
					this.setControlPointUserData( end, road.id, geometry, 1 );

				} else if ( geometry instanceof TvArcGeometry ) {

					this.createArcControlPoints( road, geometry );
				}


			} );

		} );

	}

	updateRoadGeometry ( point: Object3D, road: TvRoad, geometry: TvAbstractRoadGeometry, index: number ): void {

		if ( geometry instanceof TvLineGeometry ) {

			this.updateLineGeometry( point, road, geometry as TvLineGeometry, index );

		} else if ( geometry instanceof TvArcGeometry ) {

			this.updateArcGeometry( point, road, geometry as TvArcGeometry, index );

		}

	}

	createLineGeometry ( controlPoint1: Object3D, controlPoint2: Object3D, road: TvRoad ) {

		const start = controlPoint1.position;
		const end = controlPoint2.position;

		const hdg = Math.atan2( end.y - start.y, end.x - start.x );
		const length = road.length = start.distanceTo( end );

		const geometry = new TvLineGeometry( 0, start.x, start.y, hdg, length );
		// const geometry = road.addGeometryLine( 0, start.x, start.y, hdg, length );

		this.setControlPointUserData( controlPoint1, road.id, geometry, 0 );
		this.setControlPointUserData( controlPoint2, road.id, geometry, 1 );

		return geometry;
	}

	createSpiralGeometry ( controlPoint1: Object3D, controlPoint2: Object3D, road: TvRoad ) {

		const start = controlPoint1.position;
		const end = controlPoint2.position;

		const hdg = Math.atan2( end.y - start.y, end.x - start.x );
		const length = road.length = start.distanceTo( end );

		const geometry = new TvSpiralGeometry( 0, start.x, start.y, hdg, length, 0.005, -0.001 );
		// const geometry = road.addGeometryLine( 0, start.x, start.y, hdg, length );

		this.setControlPointUserData( controlPoint1, road.id, geometry, 0 );
		this.setControlPointUserData( controlPoint2, road.id, geometry, 1 );

		return geometry;
	}

	createArcGeometry ( cp1: Object3D, cp2: Object3D, cp3: Object3D, road: TvRoad ) {

		const start = cp1.position;
		const middle = cp2.position;
		const end = cp3.position;

		const hdg = Math.atan2( middle.y - start.y, middle.x - start.x );
		const length = road.length = start.distanceTo( end );

		const height = Maths.heightOfTriangle( start, middle, end );
		const base = start.distanceTo( end );

		const radius = ( height / 2 ) + ( ( base * base ) / ( 8 * height ) );
		let curvature = 1 / radius;

		// make the curvature negative for right side i.e. for clockwise
		if ( Maths.direction( start, middle, end ) == TvSide.RIGHT ) curvature *= -1;

		const geometry = new TvArcGeometry( 0, start.x, start.y, hdg, length, curvature );

		road.addGeometry( geometry );

		this.setControlPointUserData( cp1, road.id, geometry, 0 );
		this.setControlPointUserData( cp2, road.id, geometry, 1 );
		this.setControlPointUserData( cp3, road.id, geometry, 2 );

		geometry.cp1 = cp1;
		geometry.cp2 = cp2;
		geometry.cp3 = cp3;

		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, road );
	}

	// TODO: move this in MathUtils
	public calculateAngle ( p1: Vector3, p2: Vector3, p3: Vector3 ) {

		const A = new Vector2( p1.x, p1.y );
		const B = new Vector2( p2.x, p2.y );
		const C = new Vector2( p3.x, p3.y );

		const a = A.distanceTo( B );
		const b = B.distanceTo( C );
		const c = A.distanceTo( C );

		return Maths.Rad2Deg * Math.acos( ( a * a + b * b - c * c ) / ( 2 * a * b ) );
	}

	public updateArcGeometry ( point: Object3D, road: TvRoad, geometry: TvArcGeometry, index: number ) {

		let start: Vector3 = geometry.cp1.position;
		let middle: Vector3 = geometry.cp2.position;
		let end: Vector3 = geometry.cp3.position;

		const height = Maths.heightOfTriangle( start, middle, end );
		const base = start.distanceTo( end );

		const radius = ( height / 2 ) + ( ( base * base ) / ( 8 * height ) );

		let curvature = 1 / radius;

		// make the curvature negative for right side i.e. for clockwise
		if ( Maths.direction( start, middle, end ) == TvSide.RIGHT ) curvature *= -1;

		geometry.x = start.x;
		geometry.y = start.y;
		geometry.curvature = curvature;
		geometry.hdg = Math.atan2( middle.y - start.y, middle.x - start.x );
		geometry.length = road.length = start.distanceTo( end );

		this.removeOldAndCreateNew( road );
	}

	private updateLineGeometry ( point: Object3D, road: TvRoad, geometry: TvLineGeometry, index: number ): void {

		let start: Vector3;
		let end: Vector3;

		if ( index == 0 ) {

			start = point.position;
			end = geometry.endV3;

		} else if ( index == 1 ) {

			start = geometry.startV3;
			end = point.position;

		}

		geometry.x = start.x;

		geometry.y = start.y;

		geometry.hdg = Math.atan2( end.y - start.y, end.x - start.x );

		geometry.length = road.length = start.distanceTo( end );

		this.removeOldAndCreateNew( road );
	}

	private createArcControlPoints ( road: TvRoad, geometry: TvArcGeometry ) {

		const p1 = geometry.cp1 ? geometry.cp1.position : geometry.startV3;
		const p2 = geometry.cp2 ? geometry.cp2.position : geometry.middleV3;
		const p3 = geometry.cp3 ? geometry.cp3.position : geometry.endV3;

		const start = geometry.cp1 = this.shapeEditor.addControlPoint( p1 );
		const middle = geometry.cp2 = this.shapeEditor.addControlPoint( p2 );
		const end = geometry.cp3 = this.shapeEditor.addControlPoint( p3 );

		this.setControlPointUserData( start, road.id, geometry, 0 );
		this.setControlPointUserData( middle, road.id, geometry, 1 );
		this.setControlPointUserData( end, road.id, geometry, 2 );

	}

	private removeOldAndCreateNew ( road: TvRoad ) {
		SceneService.removeWithChildren( road.gameObject, true );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, road );
	}
}
