import { Injectable } from '@angular/core';
import { INode } from 'app/modules/three-js/objects/i-selectable';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, Color, Line, LineBasicMaterial, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Object3DArrayMap } from './lane-width/object-3d-map';

export class DebugLine<T> extends Line2 implements INode {

	isSelected: boolean;

	private DEFAULT_COLOR = COLOR.CYAN;
	private HOVERED_COLOR = COLOR.YELLOW;
	private SELECTED_COLOR = COLOR.RED;


	constructor ( public target: T, geometry: LineGeometry, material: LineMaterial ) {
		super( geometry, material );
		this.renderOrder = 999;
	}

	onMouseOver () {

		this.material.color = new Color( this.HOVERED_COLOR );
		this.material.linewidth = 4;
		this.material.needsUpdate = true;

	}

	onMouseOut () {

		this.material.color = new Color( this.DEFAULT_COLOR );
		this.material.linewidth = 2;
		this.material.needsUpdate = true;

	}

	select () {

		this.isSelected = true;

		this.material.color = new Color( this.SELECTED_COLOR );
		this.material.needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		this.material.color = new Color( this.DEFAULT_COLOR );
		this.material.needsUpdate = true;

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class LaneReferenceLineService {

	private objectMap = new Object3DArrayMap<TvRoad, Object3D[]>();

	constructor () { }

	showRoadLaneLines ( road: TvRoad, stepSize = 1.0, zOffset = 0.0, width = 2 ) {

		const lines = this.createRoadLaneLines( road, stepSize, zOffset, width );

		lines.forEach( line => {

			this.objectMap.addItem( road, line );

		} );

	}

	hideRoadLaneLines ( road: TvRoad ) {

		this.objectMap.removeKey( road );

	}

	createRoadLaneLines ( road: TvRoad, stepSize = 1.0, zOffset = 0.0, width = 2 ) {

		const lines: Object3D[] = [];

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.width.length; i++ ) {

					const laneWidth = lane.width[ i ];

					const sStart = laneWidth.s;

					// get s of next lane width node
					let sEnd = lane.width[ i + 1 ]?.s || laneSection.length;

					const points = this.getPoints( lane, sStart, sEnd, stepSize );

					const line = this.createLine( lane, points, zOffset, width );

					lines.push( line );

				}

			} );

		} );

		return lines;

	}

	createLine ( target: any, points: Vector3[], zOffset = 0.0, lineWidth = 2 ) {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z + zOffset ] ) );

		const material = new LineMaterial( {
			color: COLOR.CYAN,
			linewidth: lineWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
		} );

		const line = new DebugLine( target, geometry, material );

		line.renderOrder = 999;

		return line;

	}

	getPoints ( lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ) {

		const points: Vector3[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			points.push( this.getPoint( lane, s ) )

		}

		points.push( this.getPoint( lane, sEnd - Maths.Epsilon ) );

		return points;
	}

	private getPoint ( lane: TvLane, s: number ) {

		let posTheta = lane.laneSection.road.getRoadCoordAt( s );

		let width = lane.laneSection.getWidthUptoEnd( lane, s - lane.laneSection.s );

		// If right side lane then make the offset negative
		if ( lane.side === TvLaneSide.RIGHT ) {
			width *= -1;
		}

		posTheta.addLateralOffset( width );

		return posTheta.toVector3();

	}

}
