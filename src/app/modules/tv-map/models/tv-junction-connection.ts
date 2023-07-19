/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { TvMapQueries } from '../queries/tv-map-queries';
import { TvContactPoint } from './tv-common';
import { TvJunctionLaneLink } from './tv-junction-lane-link';
import { TvRoad } from './tv-road.model';

export class TvJunctionConnection {

	public readonly uuid: string;

	public laneLink: TvJunctionLaneLink[] = [];

	private lastAddedJunctionLaneLinkIndex: number;

	private static counter = 1;

	constructor (
		public id: number,
		public incomingRoadId: number,
		public connectingRoadId: number,
		public contactPoint: TvContactPoint,
	) {
		this.uuid = MathUtils.generateUUID();
	}

	clone () {

		const clone = new TvJunctionConnection( this.id, this.incomingRoadId, this.connectingRoadId, this.contactPoint );

		clone.laneLink = this.laneLink.map( link => link.clone() );

		return clone;
	}

	sortLinks (): void {

		this.laneLink = this.laneLink.sort( ( a, b ) => a.from > b.from ? 1 : -1 );

	}

	get connectingRoad (): TvRoad {
		return TvMapQueries.findRoadById( this.connectingRoadId );
	}

	get incomingRoad (): TvRoad {
		return TvMapQueries.findRoadById( this.incomingRoadId );
	}

	get outgoingRoad (): TvRoad {

		if ( this.contactPoint == TvContactPoint.START ) {

			return TvMapQueries.findRoadById( this.connectingRoad?.successor.elementId );

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return TvMapQueries.findRoadById( this.connectingRoad?.predecessor.elementId );

		} else {

			throw new Error( 'Invalid contact point' );

		}
	}

	/**
	 * Add a lane link record
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {number}
	 */
	public addJunctionLaneLink ( from: number, to: number ) {

		const instance = new TvJunctionLaneLink( from, to );

		this.addLaneLink( instance );

		this.lastAddedJunctionLaneLinkIndex = this.laneLink.length - 1;

		return this.lastAddedJunctionLaneLinkIndex;

	}

	addNewLink ( from: number, to: number ) {

		const link = new TvJunctionLaneLink( from, to );

		this.addLaneLink( link );

		return link;
	}

	getJunctionLaneLinkCount (): number {

		return this.laneLink.length;

	}

	getJunctionLaneLink ( index: number ): TvJunctionLaneLink {

		return this.laneLink[ index ];

	}

	public cloneJunctionLaneLink ( index ) {

		// TODO

	}

	public deleteJunctionLaneLink ( index ) {

		this.laneLink.splice( index, 1 );

	}

	public getLastAddedJunctionLaneLink (): TvJunctionLaneLink {

		return this.laneLink[ this.lastAddedJunctionLaneLinkIndex ];

	}

	public addLaneLink ( laneLink: TvJunctionLaneLink ) {

		this.laneLink.push( laneLink );

	}

	getConnectingRoad (): TvRoad {
		return undefined;
	}

	getToLaneId ( laneId: number ): number {

		for ( const link of this.laneLink ) {

			if ( link.from == laneId ) {

				return link.to;

			}

		}

		return null;
	}

	getFromLaneId ( laneId: number ): number {

		for ( const link of this.laneLink ) {

			if ( link.to == laneId ) {

				return link.from;

			}

		}

		return null;
	}

	removeLinkAtIndex ( index: number ) {

		this.laneLink.splice( index, 1 );

	}

	static create ( incomingRoad: number, connectingRoad: number, contactPoint: TvContactPoint ) {
		return new TvJunctionConnection( TvJunctionConnection.counter++, incomingRoad, connectingRoad, contactPoint );
	}

	removeLink ( laneLink: TvJunctionLaneLink ) {

		const index = this.laneLink.findIndex( link => link.from == laneLink.from && link.to == laneLink.to );

		if ( index > -1 ) {

			this.laneLink.splice( index, 1 );

		} else {

			TvConsole.warn( 'TvJunctionConnection.removeLink' + 'Link not found' );

		}


	}
}

