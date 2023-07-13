import { PointerEventData } from "app/events/pointer-event-data";
import { DynamicControlPoint } from "app/modules/three-js/objects/dynamic-control-point";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvMapQueries } from "app/modules/tv-map/queries/tv-map-queries";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineFactoryService } from "../factories/line-factory.service";
import { SceneService } from "../services/scene.service";

export abstract class PointerStrategy<T> {

	abstract onPointerDown ( pointerEventData: PointerEventData ): T;

	abstract onPointerMoved ( pointerEventData: PointerEventData ): T;

	abstract onPointerUp ( pointerEventData: PointerEventData ): void;

}

export class LaneToolStrategy extends PointerStrategy<TvLane> {

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

	onPointerUp ( pointerEventData: PointerEventData ): void {

	}

}

export class RoadToolStrategy extends PointerStrategy<TvRoad> {

	private road: TvRoad;
	private line: Line2;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoad {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		if ( Math.abs( roadCoord.t ) > 1 ) return;

		const points = roadCoord.road.getReferenceLinePoints().map( p => p.toVector3() );

		const line = this.line = LineFactoryService.createLine( points, 0xff0000 );

		SceneService.add( line );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoad {

		if ( this.line ) SceneService.remove( this.line );

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const points = roadCoord.road.getReferenceLinePoints().map( p => p.toVector3() );

		const line = this.line = LineFactoryService.createLine( points, 0xffffff );

		SceneService.add( line );

		return roadCoord.road;
	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

	}

}

export class LaneNodeStrategy<T> extends PointerStrategy<DynamicControlPoint<T>> {

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
