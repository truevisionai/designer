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

	onRoadCreated ( road: TvRoad ): void {

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

	onRoadRemoved ( road: TvRoad ): void {

		if ( road.isJunction ) {
			return;
		}

		const successorRoad = road.successor?.isRoad ? road.successor.getElement<TvRoad>() : null;

		const predecessorRoad = road.predecessor?.isRoad ? road.predecessor.getElement<TvRoad>() : null;

		if ( successorRoad && predecessorRoad && successorRoad !== predecessorRoad && successorRoad.spline === predecessorRoad.spline ) {

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

		} else {

			if ( road.successor?.contactPoint === TvContactPoint.START ) {

				successorRoad.removePredecessor();

			} else if ( road.successor?.contactPoint === TvContactPoint.END ) {

				successorRoad.removeSuccessor();

			}

			if ( road.predecessor?.contactPoint === TvContactPoint.START ) {

				predecessorRoad.removePredecessor();

			} else if ( road.predecessor?.contactPoint === TvContactPoint.END ) {

				predecessorRoad.removeSuccessor();

			}

		}

		if ( !predecessorRoad && road.successor?.isRoad && successorRoad ) {

			if ( road.successor?.contactPoint === TvContactPoint.START ) {

				successorRoad.removePredecessor();

			} else if ( road.successor?.contactPoint === TvContactPoint.END ) {

				successorRoad.removeSuccessor();

			}

		}

		if ( !successorRoad && road.predecessor?.isRoad && predecessorRoad ) {

			if ( road.predecessor?.contactPoint === TvContactPoint.START ) {

				predecessorRoad.removePredecessor();

			} else if ( road.predecessor?.contactPoint === TvContactPoint.END ) {

				predecessorRoad.removeSuccessor();

			}

		}

	}

	setPredecessor ( road: TvRoad, predecessor: TvRoad, predecessorContact: TvContactPoint ): void {

		if ( predecessorContact === TvContactPoint.START ) {

			predecessor.setPredecessorRoad( road, TvContactPoint.START );

		} else if ( predecessorContact === TvContactPoint.END ) {

			predecessor.setSuccessorRoad( road, TvContactPoint.START );

		}

	}

	setSuccessor ( road: TvRoad, successor: TvRoad, successorContact: TvContactPoint ): void {

		if ( successorContact === TvContactPoint.START ) {

			successor.setPredecessorRoad( road, TvContactPoint.END );

		} else if ( successorContact === TvContactPoint.END ) {

			successor.setSuccessorRoad( road, TvContactPoint.END );

		}

	}

}
