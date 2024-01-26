/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { TvPosTheta } from '../../../map/models/tv-pos-theta';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Position } from 'app/scenario/models/position';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';

export interface IMovingStrategy {

	setTarget ( target: any ): void;

	getPosition ( e: PointerEventData, target?: any ): Position;

}

export abstract class MovingStrategy<T> implements IMovingStrategy {

	abstract getPosition ( event: PointerEventData, target?: T ): Position;

	protected target: T;

	setTarget ( target: T ): void {

		this.target = target;

	}

	init (): void {
		//
	}

	enable (): void {
		//
	}

	disable (): void {
		//
	}

	destroy (): void {
		//
	}

	protected onRoadGeometry ( pointerEventData: PointerEventData ): TvRoadCoord {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const width = roadCoord.t > 0 ? roadCoord.road.getLeftSideWidth( roadCoord.s ) : roadCoord.road.getRightsideWidth( roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		if ( Math.abs( roadCoord.s ) < 0.01 ) return;

		return roadCoord;

	}

	protected onLaneCoord ( event: PointerEventData ): TvLaneCoord {

		const roadCoord = TvMapQueries.findRoadCoord( event.point );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		const t = roadCoord.t;

		const lanes = laneSection.lanes;

		const isLeft = t > 0;
		const isRight = t < 0;

		for ( const [ id, lane ] of lanes ) {

			// logic to skip left or right lanes depending on t value
			if ( isLeft && lane.isRight ) continue;
			if ( isRight && lane.isLeft ) continue;

			const startT = laneSection.getWidthUptoStart( lane, roadCoord.s );
			const endT = laneSection.getWidthUptoEnd( lane, roadCoord.s );

			if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {

				return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, 0 );

			}

		}
	}

}

