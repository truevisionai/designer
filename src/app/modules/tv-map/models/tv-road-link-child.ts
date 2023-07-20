/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapInstance } from '../services/tv-map-source-file';
import { TvContactPoint } from './tv-common';

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

}
