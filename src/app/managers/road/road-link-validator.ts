/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ValidationException } from "app/exceptions/exceptions";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvLink } from "app/map/models/tv-link";
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

	private validateSuccessor ( road: TvRoad, link: TvLink ): void {

		if ( !link ) return;

		this.linkedElementShouldExist( link );

		this.linkedElementDistanceShouldBeZero( road, link, RoadUtils.distanceFromSuccessor( road, road.successor ) );

	}

	private validatePredecessor ( road: TvRoad, link: TvLink ): void {

		if ( !link ) return;

		this.linkedElementShouldExist( link );

		this.linkedElementDistanceShouldBeZero( road, link, RoadUtils.distanceFromPredecessor( road, road.predecessor ) );

	}

	private linkedElementShouldExist ( link: TvLink ): void {

		if ( link.isJunction ) {

			this.mapService.map.getJunction( link.element as TvJunction );

		} else if ( link.isRoad ) {

			this.mapService.map.getRoad( link.element as TvRoad );

		}

	}

	private linkedElementDistanceShouldBeZero ( road: TvRoad, link: TvLink, distance: number ): void {

		if ( !Maths.approxEquals( distance, 0, 0.001 ) ) {

			throw new ValidationException( `InvalidLinkDistance: ${ distance } ${ road.toString() } ${ link.toString() }` );

		}

	}
}
