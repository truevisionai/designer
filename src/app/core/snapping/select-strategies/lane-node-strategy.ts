import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { PointerEventData } from '../../../events/pointer-event-data';
import { DynamicControlPoint } from '../../../modules/three-js/objects/dynamic-control-point';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvMapQueries } from '../../../modules/tv-map/queries/tv-map-queries';
import { LineFactoryService } from '../../factories/line-factory.service';
import { SceneService } from '../../services/scene.service';
import { SelectStrategy } from './select-strategy';

export class LaneNodeStrategy<T> extends SelectStrategy<DynamicControlPoint<T>> {

	private lane: TvLane;
	private line: Line2;

	constructor ( private location: 'start' | 'center' | 'end' = 'end' ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): DynamicControlPoint<T> {

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
	}

	onPointerMoved ( pointerEventData: PointerEventData ): DynamicControlPoint<T> {

		if ( !this.lane ) return;

		const node = pointerEventData.intersections.find( i => i.object instanceof THREE.Points );

		console.log( node );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		throw new Error( 'Method not implemented.' );

	}

}
