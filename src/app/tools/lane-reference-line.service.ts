import { Injectable } from '@angular/core';
import { INode } from 'app/modules/three-js/objects/i-selectable';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from 'app/services/scene.service';
import { Maths } from 'app/utils/maths';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, Color, Line, LineBasicMaterial, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

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

	constructor () { }

	showWidthNodeLines ( road: TvRoad ) {

		const lines: Object3D[] = [];

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.width.length; i++ ) {

					const laneWidth = lane.width[ i ];

					const sStart = laneWidth.s;

					// get s of next lane width node
					let sEnd = lane.width[ i + 1 ]?.s || laneSection.length;

					const points = this.getPoints( lane, sStart, sEnd );

					// const geometry = new BufferGeometry().setFromPoints( points );
					const geometry = new LineGeometry()
						.setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

					// random color for now
					// const color = Math.random() * 0xffffff;

					const material = new LineMaterial( {
						color: COLOR.CYAN,
						linewidth: 2,
						resolution: new Vector2( window.innerWidth, window.innerHeight ),
					} );

					const line = new DebugLine( lane.width, geometry, material );

					line.renderOrder = 999;

					lines.push( line );

					SceneService.addToolObject( line );

				}


			} );

		} );

		return lines;

	}

	getPoints ( lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ) {

		const points: Vector3[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			points.push( this.getPoint( lane, s ) )

		}

		points.push( this.getPoint( lane, sEnd - Maths.Epsilon ) );

		return points;
	}

	private getLaneSectionPoints ( laneSection: TvLaneSection, lane: TvLane, ) {

		return this.getPoints( lane, laneSection.s, laneSection.s + laneSection.length );

		// const points: TvPosTheta[] = [];

		// let s = laneSection.s;

		// while ( s <= laneSection.endS ) {

		// 	points.push( this.getPoint( s, laneSection, lane ) )

		// 	s++;
		// }

		// s = laneSection.endS - Maths.Epsilon;

		// points.push( this.getPoint( s, laneSection, lane ) );

		// return points;
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
