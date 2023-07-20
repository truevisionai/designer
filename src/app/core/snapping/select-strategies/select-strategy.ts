import { PointerEventData } from 'app/events/pointer-event-data';
import { TvLaneCoord, TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';

export abstract class SelectStrategy<T> {

	abstract onPointerDown ( pointerEventData: PointerEventData ): T;

	abstract onPointerMoved ( pointerEventData: PointerEventData ): T;

	abstract onPointerUp ( pointerEventData: PointerEventData ): void;

	onRoadGeometry ( pointerEventData: PointerEventData ): TvRoadCoord {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const width = roadCoord.t > 0 ? roadCoord.road.getLeftSideWidth( roadCoord.s ) : roadCoord.road.getRightsideWidth( roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) return;

		return roadCoord;

	}

	onLaneGeometry ( pointerEventData: PointerEventData, location: 'start' | 'center' | 'end' ): TvLaneCoord {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		const targetLane = laneSection.findNearestLane( roadCoord.s - laneSection.s, roadCoord.t, location );

	}

}

