/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { TvContactPoint } from './tv-common';
import { TvJunctionLaneLink } from './tv-junction-lane-link';
import { TvRoad } from './tv-road.model';

export class TvJunctionConnection {

    public readonly uuid: string;

    public laneLink: TvJunctionLaneLink[] = [];

    private lastAddedJunctionLaneLinkIndex: number;

    constructor (
        public id: number,
        public incomingRoad: number,
        public connectingRoad: number,
        public contactPoint: TvContactPoint,
        public outgoingRoad?: number
    ) {
        this.uuid = MathUtils.generateUUID();
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
}
