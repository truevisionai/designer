import { PointerEventData } from 'app/events/pointer-event-data';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneCoord, TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import * as THREE from 'three';
import { Object3D, Points } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineFactoryService } from '../factories/line-factory.service';
import { SceneService } from '../services/scene.service';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';

export abstract class PointerStrategy<T> {

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

export class OnRoadStrategy extends PointerStrategy<TvRoadCoord> {

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

}

export class ControlPointStrategy<T extends BaseControlPoint> extends PointerStrategy<T> {

	private current: T = null;
	private selected: T = null;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		this.selected?.unselect();

		this.selected = pointerEventData.intersections.find( i => i.object instanceof Points )?.object as any;

		this.selected?.select();

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		if ( !this.current?.isSelected ) this.current?.onMouseOut();

		this.current = pointerEventData.intersections.find( i => i.object instanceof Points )?.object as any;

		if ( !this.current?.isSelected ) this.current?.onMouseOver();

		return this.current;
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		return pointerEventData.intersections.find( i => i.object instanceof Points )?.object as any;

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
