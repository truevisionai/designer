/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from 'app/core/utils/console';
import { TvContactPoint, TvOrientation } from './tv-common';
import { TvRoad } from './tv-road.model';
import { TvJunction } from './junctions/tv-junction';

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

	private _element: TvRoad | TvJunction;

	private _elementType: TvRoadLinkChildType;

	private _elementId: number;

	private _contactPoint: TvContactPoint;

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
	constructor ( elementType: TvRoadLinkChildType, element: TvRoad | TvJunction, contactPoint: TvContactPoint ) {
		this._element = element;
		this._elementType = elementType;
		this._elementId = element?.id;
		this._contactPoint = contactPoint;
	}

	get element () {
		return this._element;
	}

	get isRoad () {
		return this._elementType === TvRoadLinkChildType.road;
	}

	get isJunction () {
		return this._elementType === TvRoadLinkChildType.junction;
	}

	get elementType () {
		return this._elementType;
	}

	set elementType ( value ) {
		this._elementType = value;
	}

	get elementId () {
		return this._elementId;
	}

	set elementId ( value ) {
		this._elementId = value;
	}

	get contactPoint () {
		return this._contactPoint;
	}

	set contactPoint ( value ) {
		this._contactPoint = value;
	}

	get laneSection () {

		if ( this.isRoad ) {

			const road = this.getElement<TvRoad>();

			if ( this.contactPoint == TvContactPoint.START ) {

				return road.laneSections[ 0 ];

			} else {

				return road.laneSections[ road.laneSections.length - 1 ];

			}

		}

	}

	getElement<T> (): T {
		return this.element as any;
	}

	toString () {
		return `TvRoadLinkChild: ${ this.elementType } ${ this.elementId } ${ this.contactPoint }`;
	}

	clone (): TvRoadLinkChild {

		return new TvRoadLinkChild(
			this.elementType,
			this.element,
			this.contactPoint
		);

	}

	/**
	 * @deprecated
	 */
	//getElement<T> (): T {
	//
	//	throw new Error( 'Method not implemented.' );
	//
	//	// if ( this.elementType == TvRoadLinkChildType.road ) {
	//
	//	// 	return TvMapInstance.map.getRoadById( this.elementId ) as any;
	//
	//	// } else if ( this.elementType == TvRoadLinkChildType.junction ) {
	//
	//	// 	return TvMapInstance.map.getJunctionById( this.elementId ) as any;
	//
	//	// }
	//}

	//update ( parentRoad: TvRoad, parentContact: TvContactPoint, rebuild = true ) {
	//
	//	if ( this.isRoad ) {
	//
	//		this.updateRoad( parentRoad, parentContact, rebuild );
	//
	//	} else if ( this.isJunction ) {
	//
	//		TvConsole.error( 'Junctions not supported yet' );
	//
	//	}
	//
	//}

	//updateRoad ( parentRoad: TvRoad, parentContact: TvContactPoint, rebuild = true ) {
	//
	//	if ( parentRoad.spline.type == 'explicit' ) return;
	//
	//	const elementRoad = this.getElement<TvRoad>();
	//
	//	if ( parentContact == TvContactPoint.END ) {
	//
	//		this.updateSuccessor( parentRoad, elementRoad );
	//
	//	} else {
	//
	//		this.updatePredecessor( parentRoad, elementRoad );
	//
	//	}
	//
	//	// if ( rebuild ) RoadFactory.rebuildRoad( elementRoad );
	//}

	//rebuild () {
	//
	//	if ( this.isRoad ) {
	//
	//		const road = this.getElement<TvRoad>();
	//
	//		road.updateGeometryFromSpline();
	//
	//		// RoadFactory.rebuildRoad( road );
	//
	//	} else {
	//
	//	}
	//
	//}

	//private updateSuccessor ( parentRoad: TvRoad, successor: TvRoad ) {
	//
	//	// if ( !successor ) return;
	//
	//	// successor.showSpline();
	//
	//	// const start = parentRoad.spline.getSecondLastPoint() as RoadControlPoint;
	//	// const mid1 = parentRoad.spline.getLastPoint() as RoadControlPoint;
	//	// const mid2 = this.mid2;
	//	// const end = this.end;
	//
	//	// let distance: number = mid2.position.distanceTo( end.position );
	//
	//	// mid2.position.copy( mid1.position.clone() );
	//
	//	// mid1.hdg = start.hdg;
	//
	//	// mid2.hdg = mid1.hdg + Math.PI;
	//
	//	// const newP4 = mid1.moveForward( distance );
	//
	//	// end.position.copy( newP4.position );
	//
	//	// successor.updateGeometryFromSpline();
	//}

	// this update successor points with line logic
	//private updatePredecessor ( parentRoad: TvRoad, predecessor: TvRoad ) {
	//
	//	// if ( !predecessor ) return;
	//
	//	// predecessor.showSpline();
	//
	//	// const start = parentRoad.spline.getSecondPoint() as RoadControlPoint;
	//	// const mid1 = parentRoad.spline.getFirstPoint() as RoadControlPoint;
	//	// const mid2 = this.mid2;
	//	// const end = this.end;
	//
	//	// const distance = mid2.position.distanceTo( end.position );
	//
	//	// mid2.position.copy( mid1.position.clone() );
	//
	//	// // mid2.hdg = end.hdg = mid1.hdg + Math.PI;
	//
	//	// // const newP4 = mid2.moveForward( distance );
	//
	//	// end.position.copy( newP4.position );
	//
	//	// predecessor.updateGeometryFromSpline();
	//
	//}

}
