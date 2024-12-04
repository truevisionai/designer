/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ThirdOrderPolynom } from 'app/map/models/third-order-polynom';
import { TvLane } from 'app/map/models/tv-lane';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2 } from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { DebugLine } from '../../objects/debug-line';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';

@Injectable( {
	providedIn: 'root'
} )
export class LaneSpanService {

	constructor () { }

	createLaneSpanLines ( lane: TvLane, polynomials: ThirdOrderPolynom[] ): void {

		lane.laneSection.road.laneSections.forEach( laneSection => {

			laneSection.getLanes().forEach( lane => {

				for ( let i = 0; i < polynomials.length; i++ ) {

					const cubic = polynomials[ i ];

					const sStart = cubic.s;

					// get s of next lane width node
					let sEnd = lane.getWidthArray()[ i + 1 ]?.s || laneSection.getLength();

					const points = this.getPoints( lane, sStart, sEnd, 0.1 );

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

	private getPoints ( lane: TvLane, sStart: number, sEnd: number, step: number = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = sStart; s < sEnd; s += step ) {

			const pos = lane.laneSection.road.getPosThetaAt( s )

			points.push( pos );

		}

		return points;

	}

}
