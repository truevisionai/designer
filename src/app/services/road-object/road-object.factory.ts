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

	static createMockRoadObject (): TvRoadObject {

		return new TvRoadObject( TvRoadObjectType.none, 'none', TvRoadObject.counter++, 0, 0 );

	}

	static createRoadObject ( type: TvRoadObjectType, roadCoord: TvRoadCoord ): TvRoadObject | null {

		switch ( type ) {

			case TvRoadObjectType.crosswalk:
				return this.createCrosswalkObject( roadCoord );

			default:
				throw new Error( 'Road object type not supported' );
		}

	}

	static createRoadObjectWithId ( id: number, type: TvRoadObjectType, roadCoord: TvRoadCoord ): TvRoadObject | null {

		return this.createDefaultRoadObject( id, type, roadCoord );

	}

	private static createDefaultRoadObject ( id: number, type: TvRoadObjectType, roadCoord: TvRoadCoord ): TvRoadObject {

		const roadObject = new TvRoadObject( type, '', id, roadCoord.s, roadCoord.t );

		roadObject.road = roadCoord.road;

		return roadObject

	}

	private static createCrosswalkObject ( roadCoord: TvRoadCoord ): TvRoadObject {

		const point = CornerRoadFactory.createFromCoord( roadCoord );

		const marking = new TvObjectMarking();

		marking.addCornerRoad( point );

		const outline = new TvObjectOutline( 0 );

		outline.cornerRoads.push( point );

		const crosswalk = new TvRoadObject( TvRoadObjectType.crosswalk, 'crosswalk', TvRoadObject.counter++, roadCoord.s, roadCoord.t );

		crosswalk.road = roadCoord.road;

		crosswalk.outlines.push( outline );

		crosswalk.markings.push( marking );

		return crosswalk;

	}

}
