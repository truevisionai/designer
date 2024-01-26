/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';

export abstract class SelectStrategy<T> {

	abstract onPointerDown ( pointerEventData: PointerEventData ): T;

	abstract onPointerMoved ( pointerEventData: PointerEventData ): T;

	abstract onPointerUp ( pointerEventData: PointerEventData ): T;

	select ( e: PointerEventData ): T { return this.onPointerDown( e ); }

	abstract dispose (): void;

	protected onRoadGeometry ( pointerEventData: PointerEventData ): TvRoadCoord {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const width = roadCoord.t > 0 ? roadCoord.road.getLeftSideWidth( roadCoord.s ) : roadCoord.road.getRightsideWidth( roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		if ( Math.abs( roadCoord.s ) < 0.01 ) return;

		return roadCoord;

	}

	protected onLaneGeometry ( pointerEventData: PointerEventData ): TvLane {

		const roadCoord = this.onRoadGeometry( pointerEventData );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		if ( !laneSection ) return;

		return laneSection.getLaneAt( roadCoord.s, roadCoord.t );

	}

	protected onLaneCoord ( pointerEventData: PointerEventData ): TvLaneCoord {

		const roadCoord = this.onRoadGeometry( pointerEventData );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		if ( !laneSection ) return;

		const lane = laneSection.getLaneAt( roadCoord.s, roadCoord.t );

		if ( !lane ) return;

		return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, roadCoord.t );

		// const t = roadCoord.t;

		// const lanes = laneSection.lanes;

		// const isLeft = t > 0;
		// const isRight = t < 0;

		// if ( Math.abs( t ) < 0.1 ) {
		// 	const lane = laneSection.getLaneById( 0 );
		// 	return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, 0 );
		// }

		// for ( const [ id, lane ] of lanes ) {

		// 	// logic to skip left or right lanes depending on t value
		// 	if ( isLeft && lane.isRight ) continue;
		// 	if ( isRight && lane.isLeft ) continue;

		// 	const startT = laneSection.getWidthUptoStart( lane, roadCoord.s );
		// 	const endT = laneSection.getWidthUptoEnd( lane, roadCoord.s );

		// 	if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {

		// 		return new TvLaneCoord( roadCoord.road, laneSection, lane, roadCoord.s, 0 );

		// 	}

		// }
	}

}

