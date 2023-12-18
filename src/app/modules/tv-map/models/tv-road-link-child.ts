/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from 'app/core/utils/console';
// import { TvMapInstance } from '../services/tv-map-instance';
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

	get isRoad () {
		return this.attr_elementType === TvRoadLinkChildType.road;
	}

	get isJunction () {
		return this.attr_elementType === TvRoadLinkChildType.junction;
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

	// /**
	//  * @deprecated
	//  */
	// get end () {
	// 	if ( this.contactPoint == TvContactPoint.START ) {
	// 		return this.road.spline.getSecondPoint();
	// 	} else {
	// 		return this.road.spline.getSecondLastPoint();
	// 	}
	// }

	// /**
	//  * @deprecated
	//  */
	// get mid2 () {
	// 	if ( this.contactPoint == TvContactPoint.START ) {
	// 		return this.road.spline.getFirstPoint();
	// 	} else {
	// 		return this.road.spline.getLastPoint();
	// 	}
	// }

	// /**
	//  * @deprecated
	//  */
	// get road () {

	// 	return this.getElement<TvRoad>() as TvRoad;

	// }

	// /**
	//  * @deprecated
	//  */
	// get laneSection () {

	// 	if ( this.contactPoint == TvContactPoint.START ) {

	// 		return this.road.getFirstLaneSection();

	// 	} else {

	// 		return this.road.getLastLaneSection();
	// 	}
	// }

	// setSuccessor ( element: TvRoadLinkChild ) {
	// 	// if ( this.elementType === TvRoadLinkChildType.road ) {
	// 	// 	const road = TvMapInstance.map.getRoadById( this.elementId );
	// 	// 	road.successor = element;
	// 	// }
	// }

	// setPredecessor ( element: TvRoadLinkChild ) {
	// 	// if ( this.elementType === TvRoadLinkChildType.road ) {
	// 	// 	const road = TvMapInstance.map.getRoadById( this.elementId );
	// 	// 	road.predecessor = element;
	// 	// }
	// }

	/**
	 * @deprecated
	 */
	getElement<T> (): T {

		throw new Error( 'Method not implemented.' );

		// if ( this.elementType == TvRoadLinkChildType.road ) {

		// 	return TvMapInstance.map.getRoadById( this.elementId ) as any;

		// } else if ( this.elementType == TvRoadLinkChildType.junction ) {

		// 	return TvMapInstance.map.getJunctionById( this.elementId ) as any;

		// }
	}

	update ( parentRoad: TvRoad, parentContact: TvContactPoint, rebuild = true ) {

		if ( this.isRoad ) {

			this.updateRoad( parentRoad, parentContact, rebuild );

		} else if ( this.isJunction ) {

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

		// if ( rebuild ) RoadFactory.rebuildRoad( elementRoad );
	}

	rebuild () {

		if ( this.isRoad ) {

			const road = this.getElement<TvRoad>();

			road.updateGeometryFromSpline();

			// RoadFactory.rebuildRoad( road );

		} else {

		}

	}

	clone (): TvRoadLinkChild {

		return new TvRoadLinkChild(
			this.elementType,
			this.elementId,
			this.contactPoint
		);

	}


	private updateSuccessor ( parentRoad: TvRoad, successor: TvRoad ) {

		// if ( !successor ) return;

		// successor.showSpline();

		// const start = parentRoad.spline.getSecondLastPoint() as RoadControlPoint;
		// const mid1 = parentRoad.spline.getLastPoint() as RoadControlPoint;
		// const mid2 = this.mid2;
		// const end = this.end;

		// let distance: number = mid2.position.distanceTo( end.position );

		// mid2.position.copy( mid1.position.clone() );

		// mid1.hdg = start.hdg;

		// mid2.hdg = mid1.hdg + Math.PI;

		// const newP4 = mid1.moveForward( distance );

		// end.position.copy( newP4.position );

		// successor.updateGeometryFromSpline();
	}

	// this update successor points with line logic
	private updatePredecessor ( parentRoad: TvRoad, predecessor: TvRoad ) {

		// if ( !predecessor ) return;

		// predecessor.showSpline();

		// const start = parentRoad.spline.getSecondPoint() as RoadControlPoint;
		// const mid1 = parentRoad.spline.getFirstPoint() as RoadControlPoint;
		// const mid2 = this.mid2;
		// const end = this.end;

		// const distance = mid2.position.distanceTo( end.position );

		// mid2.position.copy( mid1.position.clone() );

		// // mid2.hdg = end.hdg = mid1.hdg + Math.PI;

		// // const newP4 = mid2.moveForward( distance );

		// end.position.copy( newP4.position );

		// predecessor.updateGeometryFromSpline();

	}

}
