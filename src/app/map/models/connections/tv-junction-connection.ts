/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { TurnType, TvContactPoint } from '../tv-common';
import { TvJunction } from '../junctions/tv-junction';
import { TvJunctionLaneLink } from '../junctions/tv-junction-lane-link';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';
import { TvPosTheta } from '../tv-pos-theta';
import { Log } from 'app/core/utils/log';
import { RoadUtils } from 'app/utils/road.utils';
import { TvLink } from '../tv-link';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvLaneSection } from '../tv-lane-section';
import { TvLaneCoord } from "../tv-lane-coord";
import { LaneUtils } from 'app/utils/lane.utils';

/**

Rules
The following rules apply to connecting roads:
Each connecting road shall be represented by exactly one <connection> element.
A connecting road may contain as many lanes as required.

An incoming road with multiple lanes may be connected to the lanes of the road
leading out off the junction in different ways:

By multiple connecting roads, each with one <laneLink> element for the connection
between two specific lanes. Lane changes within this junction are not possible.

By one connecting road with multiple <laneLink> elements for the connections
between the lanes. Lane changes within this junction are possible.

The linked lanes shall fit smoothly as described for roads (see Section 8.2).
The @connectingRoad attribute shall not be used for junctions with @type="direct".

 **/
export class TvJunctionConnection {

	public readonly uuid: string;

	public laneLink: TvJunctionLaneLink[] = [];

	/**
	 * user internally to identity which connections are corner
	 * connections where we can possibly add sidewalks and
	 * non-driving lanes
	 */
	public isCornerConnection: boolean;

	private junction: TvJunction;

	private turnType: TurnType;

	/**
	 *
	 * @param id Unique ID within the junction
	 * @param incomingRoad ID of the incoming road
	 * @param connectingRoad ID of the connecting road
	 * @param contactPoint Contact point on the connecting road
	 */
	constructor (
		public id: number,
		public incomingRoad: TvRoad,
		public connectingRoad: TvRoad,
		public contactPoint: TvContactPoint,
	) {
		this.uuid = MathUtils.generateUUID();

		if ( incomingRoad?.id == connectingRoad?.id ) Log.error( 'InvalidConnection', this.toString() );

	}

	setJunction ( junction: TvJunction ): void {
		this.junction = junction;
	}

	getJunction (): TvJunction {
		return this.junction;
	}

	setTurnType ( turnType: TurnType ): void {
		this.turnType = turnType;
	}

	getTurnType (): TurnType {
		return this.turnType;
	}

	get spline (): AbstractSpline {
		return this.connectingRoad.spline;
	}

	get incomingRoadId (): number {
		return this.incomingRoad?.id;
	}

	get connectingRoadId (): number {
		return this.connectingRoad?.id;
	}

	getIncomingRoad (): TvRoad {
		return this.incomingRoad;
	}

	get connectingLaneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getLaneProfile().getFirstLaneSection();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getLaneProfile().getLastLaneSection();

		}

	}

	getRoad (): TvRoad {

		return this.connectingRoad;

	}

	getLaneSection (): TvLaneSection | undefined {

		return this.connectingRoad.getLaneProfile().getLaneSections()[ 0 ];

	}

	getSpline () {

		return this.connectingRoad.spline;

	}

	getOutgoingLink (): TvLink | null {

		return this.contactPoint == TvContactPoint.START ? this.getSuccessorLink() : this.getPredecessorLink();

	}

	getIncomingLink (): TvLink | null {

		return this.contactPoint == TvContactPoint.START ? this.getPredecessorLink() : this.getSuccessorLink();

	}

	getOutgoingRoadContact (): TvContactPoint {

		// return this.contactPoint == TvContactPoint.START ? TvContactPoint.END : TvContactPoint.START;
		return this.getSuccessorLink()?.contactPoint;

	}

	getPredecessorLink (): TvLink | null {

		if ( this.connectingRoad.predecessor ) {

			return this.connectingRoad.predecessor;

		} else {

			Log.warn( `No predecessor found for road ${ this.connectingRoad.id }` );

		}

	}

	getSuccessorLink (): TvLink | null {

		if ( this.connectingRoad.successor ) {

			return this.connectingRoad.successor

		} else {

			Log.warn( `No successor found for road ${ this.connectingRoad.id }` );

		}

	}

	toString (): string {

		return 'Connection:' + this.id + ' incomingRoad:' + this.incomingRoadId + ' connectingRoad:' + this.connectingRoadId + ' contactPoint:' + this.contactPoint;

	}

	getIncomingContactPoint (): TvContactPoint {

		const incomingPosition = this.getIncomingPosition();

		return RoadUtils.getContactByPosition( this.incomingRoad, incomingPosition.position );

	}

	getIncomingPosition (): TvPosTheta {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getStartPosTheta();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getEndPosTheta();

		}

	}

	clone () {

		const clone = new TvJunctionConnection( this.id, this.incomingRoad, this.connectingRoad, this.contactPoint );

		clone.laneLink = this.laneLink.map( link => link.clone() );

		return clone;

	}

	getJunctionLaneLinkCount (): number {

		return this.laneLink.length;

	}

	getJunctionLaneLink ( index: number ): TvJunctionLaneLink {

		return this.laneLink[ index ];

	}

	getLinks (): TvJunctionLaneLink[] {

		return this.laneLink;

	}

	getLinkCount (): number {

		return this.laneLink.length;

	}

	addLaneLink ( laneLink: TvJunctionLaneLink ) {

		const exists = this.laneLink.find( link => link.from == laneLink.from && link.to == laneLink.to );

		if ( exists ) return;

		this.laneLink.push( laneLink );

	}

	getConnectingLaneId ( laneId: number ): number {

		for ( const link of this.laneLink ) {

			if ( link.from == laneId ) {

				return link.to;

			}

		}

		return null;
	}

	getIncomingLaneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.incomingRoad.getLaneProfile().getFirstLaneSection();

		} else {

			return this.incomingRoad.getLaneProfile().getLastLaneSection();

		}

	}

	getOutgoingRoad (): TvRoad | undefined {

		return this.getOutgoingLink()?.getElement() as TvRoad;

	}

	getOutgoingLaneSection (): TvLaneSection | undefined {

		return this.getOutgoingRoad()?.getLaneProfile().getLaneSectionAtContact( this.getOutgoingRoadContact() );

	}

	getOutgoingCoords ( corner?: boolean ) {

		return this.getOutgoingLaneSection().getOutgoingCoords( this.getOutgoingRoadContact(), corner || this.isCornerConnection );

	}

	getIncomingCoords ( corner?: boolean ) {

		return this.getIncomingLaneSection().getIncomingCoords( this.contactPoint, corner || this.isCornerConnection );

	}

	getIncomingLanes (): TvLane[] {

		const direction = LaneUtils.determineDirection( this.contactPoint );

		const lanes = this.getIncomingLaneSection().getLaneArray().filter( lane => lane.direction == direction );

		if ( this.contactPoint == TvContactPoint.END ) {

			// sort in descending order
			// -1, -2, -3
			return lanes.sort( ( a, b ) => b.id - a.id );

		} else {

			// sort in ascending order
			// 1, 2, 3
			return lanes.sort( ( a, b ) => a.id - b.id );

		}

	}

	getIncomingLaneCount (): number {

		return this.getIncomingLaneSection().getLaneArray().length;

	}

	getOutgoingLanes (): TvLane[] {

		// const direction = this.isIncomingInSameDirection ? LaneUtils.determineDirection( this.contactPoint ) : LaneUtils.determineOutDirection( this.contactPoint );

		const lanes = this.getOutgoingLaneSection().getLaneArray();

		if ( this.contactPoint == TvContactPoint.END ) {

			// sort in descending order
			// -1, -2, -3
			return lanes.sort( ( a, b ) => b.id - a.id );

		} else {

			// sort in ascending order
			// 1, 2, 3
			return lanes.sort( ( a, b ) => a.id - b.id );

		}

	}

	markAsCornerConnection () {

		this.isCornerConnection = true;

	}

	getLowestLaneLink () {

		return this.getLinks().sort( ( a, b ) => a.incomingLane.id - b.incomingLane.id )[ 0 ];

	}

	getHighestLaneLink () {

		return this.getLinks().sort( ( a, b ) => b.incomingLane.id - a.incomingLane.id )[ 0 ];

	}

	private getHash (): string {

		let hash = this.incomingRoadId + '_';

		this.laneLink.forEach( link => {

			hash += '_' + link.incomingLane.id;
			hash += '_' + link.connectingRoad.successor.id;
			hash += '_' + link.connectingLane.successorId;

		} );

		return hash;
	}

	matches ( target: TvJunctionConnection ): boolean {

		return this.getHash() == target.getHash();

	}

	replaceIncomingRoad ( target: TvRoad, incomingRoad: TvRoad, incomingRoadContact: TvContactPoint ): void {

		if ( this.incomingRoad.equals( target ) ) {
			this.incomingRoad = incomingRoad;
		}

		if ( this.connectingRoad.predecessor?.isEqualTo( target ) ) {
			this.connectingRoad.setPredecessorRoad( incomingRoad, incomingRoadContact );
		}

		if ( this.connectingRoad.successor?.isEqualTo( target ) ) {
			this.connectingRoad.setSuccessorRoad( incomingRoad, incomingRoadContact );
		}

	}

	isLinkedToRoad ( target: TvRoad ): boolean {

		return this.incomingRoad.equals( target ) ||
			this.getPredecessorLink()?.isEqualTo( target ) ||
			this.getSuccessorLink()?.isEqualTo( target )

	}

	getEntryCoords (): TvLaneCoord[] { return []; }

	getExitCoords (): TvLaneCoord[] { return []; }

	protected getInnerMostDrivingLane (): TvLane {

		const drivingLanes = this.getIncomingLanes().filter( lane => lane.isDrivingLane );

		if ( this.contactPoint == TvContactPoint.END ) {

			return drivingLanes.sort( ( a, b ) => b.id - a.id )[ 0 ];

		} else {

			return drivingLanes.sort( ( a, b ) => a.id - b.id )[ 0 ];

		}

	}

}

