/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ValidationException } from "app/exceptions/exceptions";
import { TvRoadLink } from "app/map/models/tv-road-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { Maths } from "app/utils/maths";
import { RoadUtils } from "app/utils/road.utils";

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkValidator {

	constructor ( private mapService: MapService ) { }

	validateLinks ( road: TvRoad ): void {

		this.validatePredecessor( road, road.predecessor );

		this.validateSuccessor( road, road.successor );

	}

	private validateSuccessor ( road: TvRoad, link: TvRoadLink ): void {

		if ( !link ) return;

		this.linkedElementShouldExist( link );

		this.linkedElementDistanceShouldBeZero( road, link, RoadUtils.distanceFromSuccessor( road, road.successor ) );

	}

	private validatePredecessor ( road: TvRoad, link: TvRoadLink ): void {

		if ( !link ) return;

		this.linkedElementShouldExist( link );

		this.linkedElementDistanceShouldBeZero( road, link, RoadUtils.distanceFromPredecessor( road, road.predecessor ) );

	}

	private linkedElementShouldExist ( link: TvRoadLink ): void {

		if ( link.isJunction ) {

			this.mapService.map.getJunctionById( link.element.id );

		} else if ( link.isRoad ) {

			this.mapService.map.getRoadById( link.element.id );

		}

	}

	private linkedElementDistanceShouldBeZero ( road: TvRoad, link: TvRoadLink, distance: number ): void {

		if ( !Maths.approxEquals( distance, 0, 0.001 ) ) {

			throw new ValidationException( `InvalidLinkDistance: ${ distance } ${ road.toString() } ${ link.toString() }` );

		}

	}
}
