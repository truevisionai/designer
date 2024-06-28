/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkManager {

	constructor () { }

	onRoadCreated ( road: TvRoad ) {

		if ( road.isJunction ) {
			return;
		}

		if ( road.predecessor && road.predecessor?.isRoad ) {
			this.setPredecessor( road, road.predecessor.getElement<TvRoad>(), road.predecessor.contactPoint );
		}

		if ( road.successor && road.successor?.isRoad ) {
			this.setSuccessor( road, road.successor.getElement<TvRoad>(), road.successor.contactPoint );
		}

	}

	onRoadRemoved ( road: TvRoad ) {

		if ( road.isJunction ) {
			return;
		}

		const successorRoad = road.successor?.isRoad ? road.successor.getElement<TvRoad>() : null;

		const predecessorRoad = road.predecessor?.isRoad ? road.predecessor.getElement<TvRoad>() : null;

		if ( successorRoad && predecessorRoad ) {

			if ( road.successor.contactPoint === TvContactPoint.START ) {

				successorRoad.setPredecessorRoad( predecessorRoad, road.predecessor.contactPoint );

			} else {

				successorRoad.setSuccessorRoad( predecessorRoad, road.predecessor.contactPoint );

			}

			if ( road.predecessor.contactPoint === TvContactPoint.START ) {

				predecessorRoad.setPredecessorRoad( successorRoad, road.successor.contactPoint );

			} else {

				predecessorRoad.setSuccessorRoad( successorRoad, road.successor.contactPoint );

			}

		}

		if ( !predecessorRoad && road.successor?.isRoad && successorRoad ) {

			if ( road.successor.contactPoint === TvContactPoint.START ) {

				successorRoad.predecessor = null;

			} else if ( road.successor.contactPoint === TvContactPoint.END ) {

				successorRoad.successor = null;

			}

		}

		if ( !successorRoad && road.predecessor?.isRoad && predecessorRoad ) {

			if ( road.predecessor.contactPoint === TvContactPoint.START ) {

				predecessorRoad.predecessor = null;

			} else if ( road.predecessor.contactPoint === TvContactPoint.END ) {

				predecessorRoad.successor = null;

			}

		}

	}

	setPredecessor ( road: TvRoad, predecessor: TvRoad, predecessorContact: TvContactPoint ) {

		if ( predecessorContact === TvContactPoint.START ) {

			predecessor.setPredecessorRoad( road, TvContactPoint.START );

		} else if ( predecessorContact === TvContactPoint.END ) {

			predecessor.setSuccessorRoad( road, TvContactPoint.START );

		}

	}

	setSuccessor ( road: TvRoad, successor: TvRoad, successorContact: TvContactPoint ) {

		if ( successorContact === TvContactPoint.START ) {

			successor.setPredecessorRoad( road, TvContactPoint.END );

		} else if ( successorContact === TvContactPoint.END ) {

			successor.setSuccessorRoad( road, TvContactPoint.END );

		}

	}

}
