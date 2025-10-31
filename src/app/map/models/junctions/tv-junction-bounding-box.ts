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

			const points: Vector2[] = this.getPoints();

			const box = this.makeBox( points );

			this.setBox( box );

		} catch ( error ) {

			Log.error( error );

		}

	}

	private makeBox ( points: Vector2[] ): Box2 {

		if ( points.length < 2 ) {
			Log.error( 'JunctionBuilder.buildBoundingBox: Invalid boundary points', this.junction.toString() );
			return new Box2();
		}

		const box = new Box2();

		box.setFromPoints( points );

		return box;

	}

	private getPoints (): Vector2[] {

		let points = this.getEdgePointsFromConnections();

		if ( points.length == 0 ) {
			Log.warn( `Junction ${ this.junction.id } has no connections, using incoming roads for bounding box calculation` );
			points = this.getEdgePointsFromIncomingRoads();
		}

		if ( points.length == 0 ) {
			Log.error( `Junction ${ this.junction.id } has no incoming roads, using default bounding box` );
		}

		return points;
	}

	/**
	 * Collect two extreme points per connection (left/right edge at contact s)
	 */
	private getEdgePointsFromConnections (): Vector2[] {

		const out: Vector2[] = [];

		for ( const connection of this.junction.getConnections() ) {

			const road = connection.getIncomingRoad();
			const s = connection.contactPoint === TvContactPoint.START ? 0 : ( road.length - 1e-6 );
			const width = road.getRoadWidthAt( s );

			// getPosThetaAt returns TvPosTheta with x = worldX, y = worldZ in your code
			const leftPos = road.getPosThetaAt( s, width.leftSideWidth );
			const rightPos = road.getPosThetaAt( s, -width.rightSideWidth );

			out.push( new Vector2( leftPos.x, leftPos.y ) );
			out.push( new Vector2( rightPos.x, rightPos.y ) );
		}

		return out;
	}

	private getEdgePointsFromIncomingRoads (): Vector2[] {

		const points: TvPosTheta[] = [];

		this.junction.getRoadLinks().forEach( link => {

			const road = link.getElement<TvRoad>();

			const distance = link.contactPoint === TvContactPoint.START ? 0 : road.getLength();

			const width = RoadWidthService.instance.findRoadWidthAt( road, distance );

			points.push( link.getElement<TvRoad>().getPosThetaAt( distance, width.leftSideWidth ) );

			points.push( link.getElement<TvRoad>().getPosThetaAt( distance, -width.rightSideWidth ) );

		} );

		return points.map( p => new Vector2( p.x, p.y ) );
	}

}
