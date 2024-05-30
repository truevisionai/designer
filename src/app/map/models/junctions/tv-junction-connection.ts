/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { TvContactPoint } from '../tv-common';
import { TvJunction } from './tv-junction';
import { TvJunctionLaneLink } from './tv-junction-lane-link';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';
import { TvPosTheta } from '../tv-pos-theta';

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

	public junction: TvJunction;

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
		public outgoingRoad: TvRoad = null,
	) {
		this.uuid = MathUtils.generateUUID();
	}


	get incomingRoadId (): number {
		return this.incomingRoad?.id;
	}

	get connectingRoadId (): number {
		return this.connectingRoad?.id;
	}

	get outgoingRoadId (): number {
		return this.outgoingRoad?.id;
	}

	get connectingLaneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getFirstLaneSection();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getLastLaneSection();

		}

	}

	toString (): string {

		return 'JunctionConnection:' + this.id + ' incomingRoad:' + this.incomingRoadId + ' connectingRoad:' + this.connectingRoadId + ' outgoingRoad:' + this.outgoingRoadId + ' contactPoint:' + this.contactPoint;

	}

	getIncomingContactPoint (): TvContactPoint {

		const incomingPosition = this.getIncomingPosition();

		const contact = this.incomingRoad.getContactByPosition( incomingPosition.position );

		return contact;

	}

	getOutgoingContactPoint (): TvContactPoint {

		const outgoingPosition = this.getOutgoingPosition();

		const contact = this.outgoingRoad.getContactByPosition( outgoingPosition.position );

		return contact;

	}

	getIncomingPosition (): TvPosTheta {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getStartPosTheta();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getEndPosTheta();

		}

	}

	getOutgoingPosition (): TvPosTheta {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getEndPosTheta();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getStartPosTheta();

		}

	}

	clone () {

		const clone = new TvJunctionConnection( this.id, this.incomingRoad, this.connectingRoad, this.contactPoint );

		clone.laneLink = this.laneLink.map( link => link.clone() );

		return clone;
	}

	sortLinks (): void {

		this.laneLink = this.laneLink.sort( ( a, b ) => a.from > b.from ? 1 : -1 );

	}

	getJunctionLaneLinkCount (): number {

		return this.laneLink.length;

	}

	getJunctionLaneLink ( index: number ): TvJunctionLaneLink {

		return this.laneLink[ index ];

	}

	addLaneLink ( laneLink: TvJunctionLaneLink ) {

		const exists = this.laneLink.find( link => link.from == laneLink.from && link.to == laneLink.to );

		if ( exists ) return;

		this.laneLink.push( laneLink );

	}

	getToLaneId ( laneId: number ): number {

		for ( const link of this.laneLink ) {

			if ( link.from == laneId ) {

				return link.to;

			}

		}

		return null;
	}

	removeLaneLink ( laneLink: TvJunctionLaneLink ) {

		const index = this.laneLink.findIndex( link => link.from == laneLink.from && link.to == laneLink.to );

		if ( index > -1 ) {

			this.laneLink.splice( index, 1 );

			laneLink.delete();

		} else {

			TvConsole.warn( 'TvJunctionConnection.removeLink' + 'Link not found' );

		}

	}

	delete () {

		this.laneLink.splice( 0, this.laneLink.length );

		if ( !this.junction ) return;

		this.junction.removeConnectionById( this.id );

	}

	makeLaneLink ( junction: TvJunction, from: number, to: number ): TvJunctionLaneLink {

		const fromLane = this.findFromLane( junction, from );
		const toLane = this.findToLane( to );

		return new TvJunctionLaneLink( fromLane, toLane );
	}

	getIncomingLaneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.incomingRoad.getFirstLaneSection();

		} else {

			return this.incomingRoad.getLastLaneSection();

		}

	}

	getIncomingLanes (): TvLane[] {

		return this.getIncomingLaneSection().getLaneArray();

	}

	getOutgoingLanes (): TvLane[] {

		return this.outgoingRoad.getFirstLaneSection().getLaneArray();

	}

	markAsCornerConnection () {

		this.isCornerConnection = true;

	}

	private findFromLane ( junction: TvJunction, from: number ): TvLane {

		const junctionId = this.connectingRoad.junctionId;

		const successor = this.incomingRoad.successor;
		const predecessor = this.incomingRoad.predecessor;

		if ( successor?.isJunction && successor.elementId == junctionId ) {

			return this.incomingRoad.getLastLaneSection().getLaneById( from );

		} else if ( predecessor?.isJunction && predecessor.elementId == junctionId ) {

			return this.incomingRoad.getFirstLaneSection().getLaneById( from );

		}
	}

	private findToLane ( laneId: number ): TvLane {

		return this.connectingLaneSection.getLaneById( laneId );

	}
}

