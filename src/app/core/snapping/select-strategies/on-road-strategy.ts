/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/core/factories/road-factory.service';
import { SceneService } from 'app/core/services/scene.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { isArray } from 'rxjs/internal-compatibility';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { SelectStrategy } from './select-strategy';

export class OnRoadStrategy extends SelectStrategy<TvRoadCoord> {

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

	dispose (): void {
		throw new Error( 'Method not implemented.' );
	}

}


export class FindIntersection {

	static material = new MeshBasicMaterial( { color: 0xff0000 } );
	static box = new BoxGeometry( 1, 1, 1 );

	static meshes = [];

	static find ( road: TvRoad ) {

		console.time( 'find-intersection' );

		this.meshes.forEach( mesh => SceneService.remove( mesh ) );
		this.meshes = [];

		const roads = TvMapInstance.map.getRoads();

		roads.forEach( ( otherRoad ) => {

			if ( otherRoad.id === road.id ) return;

			if ( this.haveIntersection( road, otherRoad ) ) {

				console.debug( 'have intersection', road.id, otherRoad.id );

				return;
			}

			const intersection = this.intersect( road, otherRoad );

			if ( intersection ) {

				console.log( intersection, road.id, otherRoad.id );

				const mesh = new Mesh( this.box, this.material );

				mesh.position.copy( intersection );

				this.meshes.push( mesh );

				this.handleIntersection( road, otherRoad, intersection );
			}

		} );

		this.meshes.forEach( mesh => SceneService.add( mesh ) );

		console.timeEnd( 'find-intersection' );

	}

	static haveIntersection ( road: TvRoad, otherRoad: TvRoad ): boolean {

		let connections = road.gameObject.userData.connections;

		if ( isArray( connections ) && connections.includes( otherRoad.id ) ) {
			return true;
		}

		connections = otherRoad.gameObject.userData.connections;

		if ( isArray( connections ) && connections.includes( road.id ) ) {
			return true;
		}

		return false;
	}

	static handleIntersection ( road1: TvRoad, road2: TvRoad, intersection: any ) {

		const coord1 = road1.getCoordAt( intersection );
		const coord2 = road2.getCoordAt( intersection );

		const new1 = road1.cutRoad( coord1 );
		const new2 = road2.cutRoad( coord2 );

		TvMapInstance.map.addRoad( new1 );
		TvMapInstance.map.addRoad( new2 );

		RoadFactory.rebuildRoad( road1 );
		RoadFactory.rebuildRoad( new1 );
		RoadFactory.rebuildRoad( road2 );
		RoadFactory.rebuildRoad( new2 );

		// const junction = TvMapInstance.map.addNewJunction( '' );
		// junction.addConnectionFor( road1, new1, TvContactPoint.START );
		// junction.addConnectionFor( road1, road2, TvContactPoint.START );
		// junction.addConnectionFor( road2, new2, TvContactPoint.START );
		// junction.addConnectionFor( road2, new1, TvContactPoint.START );

		road1.gameObject.userData.connections = [ road1.id, road2.id, new1.id, new2.id ];
		road2.gameObject.userData.connections = [ road1.id, road2.id, new1.id, new2.id ];
		new1.gameObject.userData.connections = [ road1.id, road2.id, new1.id, new2.id ];
		new2.gameObject.userData.connections = [ road1.id, road2.id, new1.id, new2.id ];

		console.log( road1, road1.gameObject.userData.connections );
		console.log( road2, road2.gameObject.userData.connections );
		console.log( new1, new1.gameObject.userData.connections );
		console.log( new2, new2.gameObject.userData.connections );


	}

	static intersect ( road1: TvRoad, road2: TvRoad ) {

		var points1 = road1.spline.getPoints( 1 );

		var points2 = road2.spline.getPoints( 1 );

		for ( var i = 0; i < points1.length - 1; i++ ) {

			for ( var j = 0; j < points2.length - 1; j++ ) {

				var intersect = this.checkLineIntersection(
					points1[ i ], points1[ i + 1 ],

					points2[ j ], points2[ j + 1 ]
				);

				if ( intersect ) {
					return intersect; // intersection found
				}
			}
		}

	}

	static intersectBoxes ( road1: TvRoad, road2: TvRoad ) {

		var points1 = road1.spline.getPoints( 10 );
		var boxes1 = [];
		for ( var i = 0; i < points1.length - 1; i++ ) {
			boxes1.push( new Box3().setFromPoints( [ points1[ i ], points1[ i + 1 ] ] ) );
		}

		var points2 = road2.spline.getPoints( 1 );
		var boxes2 = [];
		for ( var i = 0; i < points2.length - 1; i++ ) {
			boxes2.push( new Box3().setFromPoints( [ points2[ i ], points2[ i + 1 ] ] ) );
		}

	}

	static checkLineIntersection ( line1Start, line1End, line2Start, line2End ) {

		function crossProduct ( v1, v2 ) {
			return v1.x * v2.y - v1.y * v2.x;
		}

		// The algorithm here can use the concept of cross product in 2D vectors
		// to determine whether two line segments intersect.

		// Step 1: Translate the lines by line1Start so we can use the origin
		// to simplify the calculations

		var a = line1End.clone().sub( line1Start );
		var b = line2Start.clone().sub( line1Start );
		var c = line2End.clone().sub( line1Start );

		// Step 2: Check if the lines intersect

		// If the lines intersect, the cross products a x b and a x c will have
		// different signs (i.e., the lines lie on different sides of line1)
		if ( ( crossProduct( a, b ) > 0 && crossProduct( a, c ) > 0 ) || ( crossProduct( a, b ) < 0 && crossProduct( a, c ) < 0 ) ) {
			return null;
		}

		// Now translate lines by line2Start and check again

		a = line1Start.clone().sub( line2Start );
		b = line1End.clone().sub( line2Start );
		c = line2End.clone().sub( line2Start );

		if ( ( crossProduct( a, b ) > 0 && crossProduct( a, c ) > 0 ) || ( crossProduct( a, b ) < 0 && crossProduct( a, c ) < 0 ) ) {
			return null;
		}

		// If we've gotten this far, the lines intersect
		// We return the point of intersection (in global coordinates)

		// Calculate the proportion of the intersection along line1
		var t = b.cross( a ).length() / a.cross( c ).length();

		// The point of intersection
		var intersectionPoint = line2Start.clone().lerp( line2End, t );

		return intersectionPoint;
	}


}
