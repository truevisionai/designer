/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint, TvOrientation } from './tv-common';
import { TvRoad } from './tv-road.model';
import { TvJunction } from './junctions/tv-junction';
import { TvRoadCoord } from './TvRoadCoord';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Log } from 'app/core/utils/log';
import { TvLaneCoord } from './tv-lane-coord';
import { TvLane } from './tv-lane';
import { Vector3 } from 'three';
import { TvPosTheta } from './tv-pos-theta';
import { LaneDistance } from '../road/road-distance';

export enum TvLinkType {
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
export abstract class TvLink {

	public element: TvRoad | TvJunction;

	public type: TvLinkType;

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
	protected constructor ( elementType: TvLinkType, element: TvRoad | TvJunction, contactPoint: TvContactPoint ) {

		if ( !element ) {
			throw new Error( 'Element is required' );
		}

		if ( elementType == TvLinkType.ROAD && !contactPoint ) {
			throw new Error( 'Contact point is required for road link' );
		}

		this.element = element;
		this.type = elementType;
		this.id = element.id;
		this.contactPoint = contactPoint;

	}

	abstract clone (): TvLink;

	abstract linkJunction ( junction: TvJunction ): void;

	abstract linkRoad ( element: TvRoad, contact: TvContactPoint ): void;

	abstract unlink ( element: TvRoad, contact: TvContactPoint ): void;

	abstract isEqualTo ( element: TvRoad | TvJunction ): boolean;

	abstract replace ( road: TvRoad, otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void;

	abstract getPosition (): TvPosTheta;

	get contact () {
		return this.contactPoint;
	}

	get isRoad () {
		return this.type === TvLinkType.ROAD;
	}

	get isJunction () {
		return this.type === TvLinkType.JUNCTION;
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

	getSpline (): AbstractSpline | undefined {
		return this.type == TvLinkType.ROAD ? this.getElement<TvRoad>().spline : undefined;
	}

	toLaneCoord ( lane: TvLane ) {

		if ( this.type == TvLinkType.JUNCTION ) return;

		const road = this.element as TvRoad;

		const laneDistance = this.contactPoint == TvContactPoint.START ? 0 : lane.laneSection.getLength();

		return new TvLaneCoord( road, this.laneSection, lane, laneDistance as LaneDistance, 0 );


	}

	toRoadCoord () {

		if ( this.type == TvLinkType.JUNCTION ) return;

		const road = this.element as TvRoad;

		const s = this.contactPoint == TvContactPoint.START ? 0 : road.length;

		return new TvRoadCoord( road, s, 0 );

	}

	setSuccessor ( otherRoad: TvRoad ): void {

		if ( this.type !== TvLinkType.ROAD ) {
			Log.error( 'RoadLinkError', 'Cannot set successor for junction link' );
			return;
		}

		const road = this.element as TvRoad;

		if ( this.contactPoint == TvContactPoint.START ) {

			road.setPredecessorRoad( otherRoad, TvContactPoint.END );

		} else {

			road.setSuccessorRoad( otherRoad, TvContactPoint.END );

		}

		otherRoad.setSuccessorRoad( road, this.contactPoint );

	}

	matches ( link: TvLink ): boolean {

		return this.element === link.element && this.contactPoint === link.contactPoint;

	}

}

export class TvRoadLink extends TvLink {

	constructor ( private road: TvRoad, contactPoint: TvContactPoint ) {
		super( TvLinkType.ROAD, road, contactPoint );
	}

	clone (): TvRoadLink {
		return new TvRoadLink( this.getElement<TvRoad>(), this.contactPoint );
	}

	toString (): string {
		return `Link: ${ this.element.toString() }:${ this.contactPoint }`;
	}

	isEqualTo ( element: TvRoad | TvJunction ): boolean {
		return this.element === element && this.contactPoint === this.contactPoint;
	}

	linkRoad ( otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {

		if ( this.contactPoint == TvContactPoint.START ) {
			this.road.predecessor = new TvRoadLink( otherRoad, otherRoadContact );
		} else {
			this.road.successor = new TvRoadLink( otherRoad, otherRoadContact );
		}

		if ( otherRoadContact == TvContactPoint.START ) {
			otherRoad.predecessor = new TvRoadLink( this.road, this.contactPoint );
		} else {
			otherRoad.successor = new TvRoadLink( this.road, this.contactPoint );
		}
	}

	linkJunction ( junction: TvJunction ): void {
		this.road.linkJunction( junction, this.contactPoint );
	}

	unlink ( road: TvRoad, contact: TvContactPoint ): void {
		if ( this.contactPoint == TvContactPoint.START ) {
			this.road.predecessor = null;
		} else {
			this.road.successor = null;
		}
	}

	replace ( road: TvRoad, otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {
		if ( this.contactPoint == TvContactPoint.START ) {
			this.road.linkPredecessor( otherRoad, otherRoadContact );
		} else {
			this.road.linkSuccessor( otherRoad, otherRoadContact );
		}
	}

	getPosition (): TvPosTheta {
		return this.road.getPosThetaByContact( this.contactPoint );
	}

}

export class TvJunctionLink extends TvLink {

	constructor ( private junction: TvJunction ) {
		super( TvLinkType.JUNCTION, junction, null );
	}

	clone (): TvJunctionLink {
		return new TvJunctionLink( this.getElement<TvJunction>() );
	}

	toString (): string {
		return `Link: Junction: ${ this.element.toString() }`;
	}

	isEqualTo ( element: TvRoad | TvJunction ): boolean {
		return this.element === element;
	}

	linkRoad ( otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {
		Log.error( 'RoadLinkError', 'Cannot set link for junction link' );
	}

	linkJunction ( junction: TvJunction ): void {
		Log.error( 'RoadLinkError', 'Cannot set link for junction link' );
	}

	unlink ( road: TvRoad, contact: TvContactPoint ): void {
		this.junction.removeConnectionsByRoad( road, contact );
	}

	replace ( road: TvRoad, otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {
		this.junction.replaceIncomingRoad( road, otherRoad, otherRoadContact );
	}

	getPosition (): TvPosTheta {
		Log.error( 'RoadLinkError', 'Junction link does not have position' );
		const center = this.junction.centroid;
		return new TvPosTheta( center.x, center.y, center.z, 0, 0 );

	}
}
