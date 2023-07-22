/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapInstance } from '../services/tv-map-source-file';
import { TvContactPoint } from './tv-common';
import { TvRoad } from './tv-road.model';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';

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

	update ( parentRoad: TvRoad, parentContact: TvContactPoint ) {

		if ( this.elementType === TvRoadLinkChildType.road ) {

			this.updateRoad( parentRoad, parentContact );

		} else if ( this.elementType === TvRoadLinkChildType.junction ) {

			console.error( 'Junctions not supported yet' );

		}

	}

	updateRoad ( parentRoad: TvRoad, parentContact: TvContactPoint ) {

		if ( parentRoad.spline.type == 'explicit' ) return;

		const elementRoad = this.getElement<TvRoad>();

		let point: RoadControlPoint;

		if ( this.contactPoint == TvContactPoint.START ) {

			point = elementRoad.spline.getFirstPoint() as RoadControlPoint;

		} else {

			point = elementRoad.spline.getLastPoint() as RoadControlPoint;

		}

		let parentPoint: RoadControlPoint;

		if ( parentContact == TvContactPoint.START ) {

			parentPoint = parentRoad.spline.getFirstPoint() as RoadControlPoint;

		} else {

			parentPoint = parentRoad.spline.getLastPoint() as RoadControlPoint;

		}

		point.copyPosition( parentPoint.position );


		if ( parentContact == TvContactPoint.END ) {

			this.updateSuccessor( parentRoad, point, elementRoad );

		} else {

			this.updatePredecessor( parentRoad, point, elementRoad );

		}


		// RoadFactory.rebuildRoad( elementRoad );
	}

	private updateSuccessor ( parentRoad: TvRoad, parentPoint: RoadControlPoint, successor: TvRoad ) {

		if ( !successor ) return;

		successor.showSpline();

		const start = parentRoad.spline.getSecondLastPoint() as RoadControlPoint;
		const mid1 = parentRoad.spline.getLastPoint() as RoadControlPoint;
		const mid2 = successor.spline.getFirstPoint() as RoadControlPoint;
		const end = successor.spline.getSecondPoint() as RoadControlPoint;

		let distance: number = mid2.position.distanceTo( end.position );

		mid2.copyPosition( mid1.position );

		mid1.hdg = start.hdg;

		mid2.hdg = mid1.hdg + Math.PI;

		const newP4 = mid1.moveForward( distance );

		end.copyPosition( newP4.position );

		successor.spline.update();

		console.log( 'updateSuccessor', newP4.position );


	}

	private updatePredecessor ( parentRoad: TvRoad, parentPoint: RoadControlPoint, predecessor: TvRoad ) {

		if ( !predecessor ) return;

		const P1 = parentRoad.spline.controlPoints[ 1 ] as RoadControlPoint;
		const P2 = parentRoad.spline.controlPoints[ 0 ] as RoadControlPoint;

		predecessor.showSpline();

		let P3: RoadControlPoint;

		let P4: RoadControlPoint;

		let newP4: RoadControlPoint;

		let distance: number;

		P3 = predecessor.spline.getLastPoint() as RoadControlPoint;

		P4 = predecessor.spline.getSecondLastPoint() as RoadControlPoint;

		distance = P3.position.distanceTo( P4.position );

		P3.copyPosition( P2.position );

		P3.hdg = P4.hdg = P2.hdg + Math.PI;

		newP4 = P3.moveForward( distance );

		P4.copyPosition( newP4.position );

		predecessor.spline.update();

		console.log( 'updatePredecessor', newP4.position );
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

			road.updateGeometryFromSpline()

			RoadFactory.rebuildRoad( road );

		} else {

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

}
