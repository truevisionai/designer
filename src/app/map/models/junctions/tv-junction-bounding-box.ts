/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Log } from "app/core/utils/log";
import { RoadWidthService } from "app/services/road/road-width.service";
import { Box2, Vector2 } from "three";
import { TvContactPoint } from "../tv-common";
import { TvPosTheta } from "../tv-pos-theta";
import { TvRoad } from "../tv-road.model";
import { TvJunction } from "./tv-junction";


export class TvJunctionBoundingBox {

	private boundingBox: Box2;

	constructor ( private junction: TvJunction ) {

		this.boundingBox = new Box2();

	}

	getBox (): Box2 {
		return this.boundingBox;
	}

	setBox ( box: Box2 ): void {
		this.boundingBox.copy( box );
	}

	update (): void {

		try {

			const points: TvPosTheta[] = this.getPoints();

			const box = this.makeBox( points );

			this.setBox( box );

		} catch ( error ) {

			Log.error( error );

		}

	}

	private makeBox ( points: TvPosTheta[] ): Box2 {

		if ( points.length < 2 ) {
			Log.error( 'JunctionBuilder.buildBoundingBox: Invalid boundary points', this.junction.toString() );
			return new Box2();
		}

		const box = new Box2();

		box.setFromPoints( points.map( p => new Vector2( p.x, p.y ) ) );

		return box;

	}

	private getPoints (): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		this.junction.getRoadLinks().forEach( link => {

			const road = link.getElement<TvRoad>();

			const distance = link.contactPoint === TvContactPoint.START ? 0 : road.getLength();

			const width = RoadWidthService.instance.findRoadWidthAt( road, distance );

			points.push( link.getElement<TvRoad>().getPosThetaAt( distance, width.leftSideWidth ) );

			points.push( link.getElement<TvRoad>().getPosThetaAt( distance, -width.rightSideWidth ) );

		} );

		return points;

	}

}
