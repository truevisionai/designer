/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvObjectOutline } from 'app/map/models/objects/tv-object-outline';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { CornerRoadFactory } from './corner-road.factory';

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectFactory {

	constructor (
		private cornerFactory: CornerRoadFactory
	) { }

	createRoadObject ( roadCoord: TvRoadCoord, type: TvRoadObjectType ): TvRoadObject | null {

		switch ( type ) {

			case TvRoadObjectType.crosswalk:
				return this.createCrosswalkObject( roadCoord );

			default:
				return null;
		}

	}

	private createCrosswalkObject ( roadCoord: TvRoadCoord ): TvRoadObject {

		const point = this.cornerFactory.createFromCoord( roadCoord );

		const marking = new TvObjectMarking();

		marking.addCornerRoad( point );

		const outline = new TvObjectOutline();

		outline.cornerRoad.push( point );

		const crosswalk = new TvRoadObject( TvRoadObjectType.crosswalk, 'crosswalk', TvRoadObject.counter++, roadCoord.s, roadCoord.t );

		crosswalk.road = roadCoord.road;

		crosswalk.outlines.push( outline );

		crosswalk.markings.push( marking );

		return crosswalk;

	}

}
