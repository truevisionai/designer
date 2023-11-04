/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/factories/road-factory.service';
import { TvConsole } from 'app/core/utils/console';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { Vector3 } from 'three';
import { TvMapInstance } from '../services/tv-map-source-file';
import { TvContactPoint, TvOrientation } from './tv-common';
import { TvRoad } from './tv-road.model';

export enum TvRoadLinkChildType {
	road = 'road',
	junction = 'junction'
}

/**

In ASAM OpenDRIVE, road linkage is represented by the <link> element within the
<road> element. The <predecessor> and <successor> elements are defined within
the <link> element. A successor of a given road is an element connected to
the end of its reference line. A predecessor of a given road is an element
connected to the start of its reference line. For junctions, different
attribute sets shall be used for the <predecessor> and <successor> elements.

Rules

The following rules apply to road linkage:

Two roads shall only be linked directly, if the linkage is clear.
If the relationship to successor or predecessor is ambiguous, junctions shall be used.

A road may have another road or a junction as successor or predecessor.
A road may also have no successor or predecessor.

A road may serve as its own predecessor or successor. (usefull for cirular roads)

For a road as successor or predecessor the @elemetType,
@elementId and @contactPoint attributes shall be used.

For a common junction and a direct junction as successor or predecessor
the @elemetType and @elementId attributes shall be used.

For a virtual junction as successor or predecessor the
@elemetType, @elementId, @elementS and @elementDir attributes shall be used.

 */
export class TvRoadLinkChild {

	public attr_elementType: TvRoadLinkChildType;
	public attr_elementId: number;
	public attr_contactPoint: TvContactPoint;

	/**
	 * TODO:
	 *
	 * elementDir: To be provided when elementS is used for the connection definition.
	 * Indicates the direction on the predecessor from which the road is entered.
	 *
	 * elementS: Alternative to contactPoint for virtual junctions. Indicates a
	 * connection within the predecessor, meaning not at the start or end of the
	 * predecessor. Shall only be used for elementType "road"
	 *
	 */

	/**
	 * To be provided when elementS is used for the connection definition.
	 * Indicates the direction on the predecessor from which the road is entered.
	 */
	public elementS?: number;

	/**
	 * Alternative to contactPoint for virtual junctions. Indicates a connection
	 * within the predecessor, meaning not at the start or end of the
	 * predecessor. Shall only be used for elementType "road"
	 */
	public elementDir?: TvOrientation;

	/**
	 *
	 * @param elementType
	 * @param elementId ID of the linked element
	 * @param contactPoint Contact point of link on the linked element
	 */
	constructor ( elementType: TvRoadLinkChildType, elementId: number, contactPoint: TvContactPoint ) {
		this.attr_elementType = elementType;
		this.attr_elementId = elementId;
		this.attr_contactPoint = contactPoint;
	}

	get elementType () {
		return this.attr_elementType;
	}

	set elementType ( value ) {
		this.attr_elementType = value;
	}

	get elementId () {
		return this.attr_elementId;
	}

	set elementId ( value ) {
		this.attr_elementId = value;
	}

	get contactPoint () {
		return this.attr_contactPoint;
	}

	set contactPoint ( value ) {
		this.attr_contactPoint = value;
	}

	get end () {
		if ( this.contactPoint == TvContactPoint.START ) {
			return this.road.spline.getSecondPoint() as RoadControlPoint;
		} else {
			return this.road.spline.getSecondLastPoint() as RoadControlPoint;
		}
	}

	get mid2 () {
		if ( this.contactPoint == TvContactPoint.START ) {
			return this.road.spline.getFirstPoint() as RoadControlPoint;
		} else {
			return this.road.spline.getLastPoint() as RoadControlPoint;
		}
	}

	get road () {

		return this.getElement<TvRoad>() as TvRoad;

	}

	get laneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.road.getFirstLaneSection();

		} else {

			return this.road.getLastLaneSection();
		}
	}

	setSuccessor ( element: TvRoadLinkChild ) {
		if ( this.elementType === TvRoadLinkChildType.road ) {
			const road = TvMapInstance.map.getRoadById( this.elementId );
			road.successor = element;
		}
	}

	setPredecessor ( element: TvRoadLinkChild ) {
		if ( this.elementType === TvRoadLinkChildType.road ) {
			const road = TvMapInstance.map.getRoadById( this.elementId );
			road.predecessor = element;
		}
	}

	getSuccessor () {
		if ( this.elementType === TvRoadLinkChildType.road ) {
			const road = TvMapInstance.map.getRoadById( this.elementId );
			return road.successor;
		}
	}

	getPredecessor () {
		if ( this.elementType === TvRoadLinkChildType.road ) {
			const road = TvMapInstance.map.getRoadById( this.elementId );
			return road.predecessor;
		}
	}

	getElement<T> (): T {

		if ( this.elementType == TvRoadLinkChildType.road ) {

			return TvMapInstance.map.getRoadById( this.elementId ) as any;

		} else if ( this.elementType == TvRoadLinkChildType.junction ) {

			return TvMapInstance.map.getJunctionById( this.elementId ) as any;

		}
	}

	update ( parentRoad: TvRoad, parentContact: TvContactPoint, rebuild = true ) {

		if ( this.elementType === TvRoadLinkChildType.road ) {

			this.updateRoad( parentRoad, parentContact, rebuild );

		} else if ( this.elementType === TvRoadLinkChildType.junction ) {

			TvConsole.error( 'Junctions not supported yet' );

		}

	}

	updateRoad ( parentRoad: TvRoad, parentContact: TvContactPoint, rebuild = true ) {

		if ( parentRoad.spline.type == 'explicit' ) return;

		const elementRoad = this.getElement<TvRoad>();

		if ( parentContact == TvContactPoint.END ) {

			this.updateSuccessor( parentRoad, elementRoad );

		} else {

			this.updatePredecessor( parentRoad, elementRoad );

		}

		if ( rebuild ) RoadFactory.rebuildRoad( elementRoad );
	}

	hideSpline () {

		if ( this.elementType == TvRoadLinkChildType.road ) {

			this.getElement<TvRoad>().hideSpline();

		} else {

		}

	}

	rebuild () {

		if ( this.elementType == TvRoadLinkChildType.road ) {

			const road = this.getElement<TvRoad>();

			road.updateGeometryFromSpline();

			RoadFactory.rebuildRoad( road );

		} else {

		}

	}

	private updateSuccessor ( parentRoad: TvRoad, successor: TvRoad ) {

		if ( !successor ) return;

		successor.showSpline();

		const start = parentRoad.spline.getSecondLastPoint() as RoadControlPoint;
		const mid1 = parentRoad.spline.getLastPoint() as RoadControlPoint;
		const mid2 = this.mid2;
		const end = this.end;

		let distance: number = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid1.hdg = start.hdg;

		mid2.hdg = mid1.hdg + Math.PI;

		const newP4 = mid1.moveForward( distance );

		end.position.copy( newP4.position );

		successor.updateGeometryFromSpline();
	}

	// this update successor points with line logic
	private updateSuccessorV2 ( parentRoad: TvRoad, parentPoint: RoadControlPoint, successor: TvRoad ) {

		// assumign points
		// start, mid1, mid2, end

		if ( !successor ) return;

		successor.showSpline();

		const start = parentRoad.spline.getSecondLastPoint();
		const mid1 = parentRoad.spline.getLastPoint();
		const mid2 = successor.spline.getFirstPoint();
		const end = successor.spline.getSecondPoint();

		const distanceAB = start.position.distanceTo( mid1.position );
		const distanceAC = start.position.distanceTo( mid2.position );

		var direction = new Vector3();
		direction.subVectors( end.position, start.position );
		direction.normalize();

		// Now calculate positions for B and C based on distances
		mid1.position.copy( direction ).multiplyScalar( distanceAB ).add( start.position );
		mid2.position.copy( direction ).multiplyScalar( distanceAC ).add( start.position );

		successor.updateGeometryFromSpline();

	}

	private updatePredecessor ( parentRoad: TvRoad, predecessor: TvRoad ) {

		if ( !predecessor ) return;

		predecessor.showSpline();

		const start = parentRoad.spline.getSecondPoint() as RoadControlPoint;
		const mid1 = parentRoad.spline.getFirstPoint() as RoadControlPoint;
		const mid2 = this.mid2;
		const end = this.end;

		const distance = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid2.hdg = end.hdg = mid1.hdg + Math.PI;

		const newP4 = mid2.moveForward( distance );

		end.position.copy( newP4.position );

		predecessor.updateGeometryFromSpline();

	}

}
