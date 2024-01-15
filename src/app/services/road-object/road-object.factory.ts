import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvObjectOutline } from 'app/modules/tv-map/models/objects/tv-object-outline';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { CornerRoadFactory } from './corner-road.factory';

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectFactory {

	constructor (
		private cornerFactory: CornerRoadFactory
	) { }

	createRoadObject ( roadCoord: TvRoadCoord, type: ObjectTypes ): TvRoadObject | null {

		switch ( type ) {

			case ObjectTypes.crosswalk:
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

		const crosswalk = new TvRoadObject( ObjectTypes.crosswalk, 'crosswalk', TvRoadObject.counter++, roadCoord.s, roadCoord.t );

		crosswalk.road = roadCoord.road;

		crosswalk.outlines.push( outline );

		crosswalk.markings.push( marking );

		return crosswalk;

	}

}
