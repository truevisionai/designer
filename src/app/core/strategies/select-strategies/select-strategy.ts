/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { RoadWidthService } from 'app/services/road/road-width.service';
import { Intersection, Object3D, Vector3 } from "three";

export interface SelectionStrategy<T> {

	// @deprecated
	onPointerDown ( pointerEventData: PointerEventData ): T | undefined;

	// @deprecated
	onPointerMoved ( pointerEventData: PointerEventData ): T | undefined;

	// @deprecated
	onPointerUp ( pointerEventData: PointerEventData ): T | undefined;

	handleSelection ( e: PointerEventData ): T | undefined;

}

export abstract class BaseSelectionStrategy<T> implements SelectionStrategy<T> {

	abstract onPointerDown ( pointerEventData: PointerEventData ): T | undefined;

	abstract onPointerMoved ( pointerEventData: PointerEventData ): T | undefined;

	abstract onPointerUp ( pointerEventData: PointerEventData ): T | undefined;

	handleSelection ( e: PointerEventData ): T | undefined {
		return this.onPointerDown( e );
	}

	abstract dispose (): void;

	protected onRoadGeometry ( pointerEventData: PointerEventData ): TvRoadCoord {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const width = roadCoord.t > 0 ?
			RoadWidthService.instance.findLeftWidthAt( roadCoord.road, roadCoord.s ) :
			RoadWidthService.instance.findRightWidthAt( roadCoord.road, roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		if ( Math.abs( roadCoord.s ) < 0.01 ) return;

		return roadCoord;

	}

	protected onNonJunctionRoadGeometry ( pointerEventData: PointerEventData ): TvRoadCoord {

		const roadCoord = TvMapQueries.findNonJunctionRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const width = roadCoord.t > 0 ?
			RoadWidthService.instance.findLeftWidthAt( roadCoord.road, roadCoord.s ) :
			RoadWidthService.instance.findRightWidthAt( roadCoord.road, roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		if ( Math.abs( roadCoord.s ) < 0.01 ) return;

		return roadCoord;

	}

	protected onLaneGeometry ( pointerEventData: PointerEventData ): TvLane | undefined {

		const roadCoord = this.onRoadGeometry( pointerEventData );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneProfile().getLaneSectionAt( roadCoord.s );

		if ( !laneSection ) return;

		return laneSection.getLaneAt( roadCoord.s, roadCoord.t );

	}

	protected onLaneCoord ( pointerEventData: PointerEventData ): TvLaneCoord | undefined {

		const roadCoord = this.onRoadGeometry( pointerEventData );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneProfile().getLaneSectionAt( roadCoord.s );

		if ( !laneSection ) return;

		const lane = laneSection.getLaneAt( roadCoord.s, roadCoord.t );

		if ( !lane ) return;

		return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, roadCoord.t );

		// const t = roadCoord.t;

		// const lanes = laneSection.lanes;

		// const isLeft = t > 0;
		// const isRight = t < 0;

		// if ( Math.abs( t ) < 0.1 ) {
		// 	const lane = laneSection.getLaneById( 0 );
		// 	return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, 0 );
		// }

		// for ( const [ id, lane ] of lanes ) {

		// 	// logic to skip left or right lanes depending on t value
		// 	if ( isLeft && lane.isRight ) continue;
		// 	if ( isRight && lane.isLeft ) continue;

		// 	const startT = laneSection.getWidthUptoStart( lane, roadCoord.s );
		// 	const endT = laneSection.getWidthUptoEnd( lane, roadCoord.s );

		// 	if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {

		// 		return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, 0 );

		// 	}

		// }
	}

	protected findNearestObject ( point: Vector3, intersections: Intersection[] ): Object3D | undefined {

		const nearestIntersection = this.findNearestIntersection( point, intersections );

		if ( !nearestIntersection ) return;

		return nearestIntersection.object;

	}

	protected findNearestIntersection ( point: Vector3, intersections: Intersection[] ): Intersection | undefined {

		if ( intersections.length === 0 ) return;

		let nearestIntersection = intersections[ 0 ];

		for ( let i = 1; i < intersections.length; i++ ) {

			const currentDistance = nearestIntersection.object.position.distanceTo( point );
			const newDistance = intersections[ i ].object.position.distanceTo( point );

			if ( newDistance < currentDistance ) {

				nearestIntersection = intersections[ i ];

			}

		}

		return nearestIntersection;

	}

	protected findPoints ( intersections: Intersection[] ): Object3D[] {

		return intersections
			.filter( i => i.object.visible )
			.filter( i => i.object.type === 'Points' )
			.map( i => i.object );

	}

	protected findByType ( intersections: Intersection[], type: any ): Object3D | undefined {

		const objects = intersections
			.filter( i => i.object.visible == true )
			.map( i => i.object );

		return objects.find( o => o instanceof type );

	}

	protected findByTag ( tag: string, intersections: Intersection[] ): Object3D | undefined {

		const objects = intersections
			.filter( intersection => intersection.object !== undefined )
			.map( intersection => intersection.object );

		return objects.find( ( object: Object3D ) => object[ 'tag' ] === tag );

	}

	protected findRoad ( pointerEventData: PointerEventData, includeJunctionRoads: boolean ): TvRoad | undefined {

		const coord = includeJunctionRoads ?
			this.onRoadGeometry( pointerEventData ) :
			this.onNonJunctionRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !includeJunctionRoads ) {
			return;
		}

		return coord.road;

	}

	protected findSpline ( pointerEventData: PointerEventData, includeJunctionRoads: boolean ): AbstractSpline | undefined {

		const road = this.findRoad( pointerEventData, includeJunctionRoads );

		if ( !road ) return;

		return road.spline;

	}
}

export abstract class NewSelectionStrategy<T> extends BaseSelectionStrategy<T> {

	abstract handleSelection ( e: PointerEventData ): T;

	onPointerDown ( pointerEventData: PointerEventData ): T {
		return this.handleSelection( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {
		return this.handleSelection( pointerEventData );
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {
		return this.handleSelection( pointerEventData );
	}

	dispose (): void {

	}

}

