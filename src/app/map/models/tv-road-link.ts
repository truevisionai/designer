/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint, TvOrientation } from './tv-common';
import { TvRoad } from './tv-road.model';
import { TvJunction } from './junctions/tv-junction';
import { TvRoadCoord } from './TvRoadCoord';

export enum TvRoadLinkType {
	ROAD = 'road',
	JUNCTION = 'junction'
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
export class TvRoadLink {

	public element: TvRoad | TvJunction;

	public type: TvRoadLinkType;

	public id: number;

	public contactPoint: TvContactPoint;

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
	 * @param elementType Type of linked element (road or junction)
	 * @param element Linked element (road or junction)
	 * @param contactPoint Contact point of link on the linked element
	 */
	constructor ( elementType: TvRoadLinkType, element: TvRoad | TvJunction, contactPoint: TvContactPoint ) {

		if ( !element ) {
			throw new Error( 'Element is required' );
		}

		if ( elementType == TvRoadLinkType.ROAD && !contactPoint ) {
			throw new Error( 'Contact point is required for road link' );
		}

		this.element = element;
		this.type = elementType;
		this.id = element.id;
		this.contactPoint = contactPoint;

	}

	get isRoad () {
		return this.type === TvRoadLinkType.ROAD;
	}

	get isJunction () {
		return this.type === TvRoadLinkType.JUNCTION;
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

		if ( this.type == TvRoadLinkType.ROAD ) {

			return `Link: ${ this.type }:${ this.id } Contact:${ this.contactPoint }`;

		} else {

			return `Link: ${ this.type }:${ this.id }`;

		}

	}

	toRoadCoord () {

		if ( this.type == TvRoadLinkType.JUNCTION ) return;

		const road = this.element as TvRoad;

		const s = this.contactPoint == TvContactPoint.START ? 0 : road.length;

		return new TvRoadCoord( road, s, 0 );

	}

	clone (): TvRoadLink {

		return new TvRoadLink(
			this.type,
			this.element,
			this.contactPoint
		);

	}

}
