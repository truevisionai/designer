import { Injectable } from '@angular/core';
import { ThirdOrderPolynom } from 'app/modules/tv-map/models/third-order-polynom';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { DebugLine } from './debug-line';
import { DebugDrawService } from './debug-draw.service';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LaneWidthNode } from 'app/modules/three-js/objects/lane-width-node';
import { LaneWidthService } from 'app/tools/lane-width/lane-width.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2, Vector3 } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSpanService {

	constructor (
		private debug: DebugDrawService
	) { }


	createLinesForPolynom<T> ( road: TvRoad, target: T, cubics: ThirdOrderPolynom[] ): DebugLine<T>[] {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < cubics.length; i++ ) {

					const cubic = cubics[ i ];

					const sStart = cubic.s;

					// get s of next lane width node
					let sEnd = lane.width[ i + 1 ]?.s || laneSection.length;

					const points = this.debug.getLanePoints( lane, sStart, sEnd, 0.1 );

					const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

					const material = new LineMaterial( {
						color: COLOR.CYAN,
						linewidth: 2,
						resolution: new Vector2( window.innerWidth, window.innerHeight ),
						depthTest: false,
						depthWrite: false,
					} );

					const line = new DebugLine( cubic, geometry, material );

				}

			} );

		} );

	}

	createLineForPolynom<T> ( road: TvRoad, target: T, cubic: ThirdOrderPolynom ): DebugLine<T> {

		//

	}

	createLine<T> ( road: TvRoad, target: T, s: number[] ): DebugLine<T> {

		//

	}



}
