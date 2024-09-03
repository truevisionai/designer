/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Log } from 'app/core/utils/log';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoadLink } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapQueryService } from 'app/map/queries/map-query.service';
import { MapService } from 'app/services/map/map.service';
import { Maths } from 'app/utils/maths';
import { RoadUtils } from 'app/utils/road.utils';

export function expectLinkDistanceToBeZero ( road: TvRoad ): void {
	if ( road.successor ) {
		const distance = RoadUtils.distanceFromSuccessor( road, road.successor );
		if ( !Maths.approxEquals( distance, 0 ) ) {
			Log.error( `InvalidSuccessorDistance: ${ distance } ${ road.toString() } ${ road.successor.toString() }` );
		}
	}
	if ( road.predecessor ) {
		const distance = RoadUtils.distanceFromPredecessor( road, road.predecessor )
		if ( !Maths.approxEquals( distance, 0 ) ) {
			Log.error( `InvalidPredecessorDistance: ${ distance } ${ road.toString() } ${ road.predecessor.toString() }` );
		}
	}
}

@Injectable( {
	providedIn: 'root'
} )
export class RoadValidator {

	private debug = true;
	private enabled = true;

	constructor ( private map: MapService, private queryService: MapQueryService ) { }

	validateRoad ( road: TvRoad ): void {

		expectLinkDistanceToBeZero( road );

		if ( !this.enabled ) return;

		this.validateLinks( road );

	}

	private validateLinks ( road: TvRoad ): void {

		if ( road.successor ) this.validateLink( road, road.successor );

		if ( road.predecessor ) this.validateLink( road, road.predecessor );

	}

	private validateLink ( road: TvRoad, link: TvRoadLink ): void {

		let linkedElement: TvJunction | TvRoad;

		if ( link.isJunction ) {

			linkedElement = this.map.findJunction( link.element.id );

		} else if ( link.isRoad ) {

			linkedElement = this.map.getRoad( link.element.id );

		} else {

			Log.warn( "Invalid Link", road.toString(), link.toString() );

		}

		if ( !linkedElement ) {

			Log.warn( "Link element not found", road.toString(), link.toString() );

		}

	}


}
