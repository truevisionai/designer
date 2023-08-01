/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Line2 } from 'three/examples/jsm/lines/Line2';
import { PointerEventData } from '../../../events/pointer-event-data';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvMapQueries } from '../../../modules/tv-map/queries/tv-map-queries';
import { LineFactoryService } from '../../factories/line-factory.service';
import { SceneService } from '../../services/scene.service';
import { SelectStrategy } from './select-strategy';

export class LaneToolStrategy extends SelectStrategy<TvLane> {

	private lane: TvLane;
	private line: Line2;

	constructor ( private location: 'start' | 'center' | 'end' = 'end' ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvLane {
		return this.onPointerMoved( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvLane {

		// if ( this.line ) SceneService.remove( this.line );

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		const targetLane = laneSection.findNearestLane( roadCoord.s - laneSection.s, roadCoord.t, this.location );

		if ( !targetLane ) {

			if ( this.line ) SceneService.remove( this.line );

			if ( this.lane ) this.lane = null;

			return;

		} else if ( this.lane && this.lane.uuid === targetLane.uuid ) {

			return;

		}

		this.lane = targetLane;

		if ( !this.line ) {

			this.line = LineFactoryService.createLaneLine( targetLane, this.location, 0xffffff );

		} else {

			this.line.geometry.dispose();

			this.line.geometry = LineFactoryService.createLaneLineGeometry( targetLane, this.location );

		}

		SceneService.add( this.line );

		return targetLane;
	}

	onPointerUp ( pointerEventData: PointerEventData ): TvLane {
		return this.onPointerMoved( pointerEventData );
	}
	dispose (): void {
		throw new Error( 'Method not implemented.' );
	}

}

export class OnLaneStrategy extends SelectStrategy<TvLane> {

	private lane: TvLane;
	private selected: TvLane;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvLane {

		// this.selected?.unselect();

		this.selected = this.onLaneGeometry( pointerEventData )

		// this.selected?.select();

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvLane {

		this.lane?.unhighlight();

		this.lane = this.onLaneGeometry( pointerEventData )

		this.lane?.highlight();

		return this.lane;
	}

	onPointerUp ( pointerEventData: PointerEventData ): TvLane {

		return this.onLaneGeometry( pointerEventData )

	}

	dispose (): void {

		this.lane?.unhighlight();
		this.selected?.unselect();

	}

}
