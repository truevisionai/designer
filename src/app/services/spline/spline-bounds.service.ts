/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { TvRoad } from "app/map/models/tv-road.model";
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { Box2, Vector2 } from "three";
import { RoadWidthService } from "../road/road-width.service";
import { Maths } from "app/utils/maths";

@Injectable( {
	providedIn: 'root'
} )
export class SplineBoundsService {

	private static _instance: SplineBoundsService;

	static get instance (): SplineBoundsService {

		if ( !SplineBoundsService._instance ) {
			SplineBoundsService._instance = new SplineBoundsService();
		}

		return SplineBoundsService._instance;
	}

	constructor () {
	}

	updateBounds ( spline: AbstractSpline ): void {

		this.updateWidthCache( spline );

		this.updateBoundPoints( spline );

	}

	private updateWidthCache ( spline: AbstractSpline ): void {

		spline.widthCache.clear();

		const roads = spline.getRoadSegments();

		let lastWidth = -1;

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			for ( let s = 0; s <= road.length; s += 5 ) {

				const width = RoadWidthService.instance.findTotalWidthAt( road, s );

				if ( width !== lastWidth ) {

					spline.widthCache.set( road.sStart + s, width );

					lastWidth = width;

				}

			}

		}
	}

	// eslint-disable-next-line max-lines-per-function
	private isInvalid ( spline: AbstractSpline ): boolean {

		if ( spline.getSegmentCount() == 0 ) {
			Log.warn( 'No segments found in spline', spline?.toString() );
			return true;
		}

		if ( spline.getControlPointCount() < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return true;
		}

		if ( spline.getGeometryCount() == 0 ) {
			Log.warn( 'No geometries found in spline', spline?.toString() );
			return true;
		}

		// NOTE: many imported splines from OSM have length less than 1
		// so we need to check for 0
		if ( Maths.approxEquals( spline.getLength(), 0 ) ) {
			Log.warn( 'Invalid spline length', spline?.toString() );
			return true;
		}

		if ( spline.getRoadSegments().length < 1 ) {
			Log.warn( 'No road segments found in spline', spline?.toString() );
			return true;
		}

		return false;
	}

	// eslint-disable-next-line max-lines-per-function
	private updateBoundPoints ( spline: AbstractSpline ): void {

		if ( this.isInvalid( spline ) ) return;

		// this buffer is added to left/right and center points to create a bounding box
		// to explain the width of the road
		// helps in intersection
		const BUFFER = 1;

		spline.leftPoints = [];
		spline.rightPoints = [];
		spline.centerPoints = [];

		let roadWidth: { leftSideWidth: number; rightSideWidth: number; totalWidth: number; };

		const firstRoad = spline.getRoadSegments()[ 0 ];

		roadWidth = RoadWidthService.instance.findRoadWidthAt( firstRoad, 0 );

		const boundingBox = new Box2();

		let startPoints: { center: TvPosTheta; left: TvPosTheta; right: TvPosTheta; };
		let endPoints: { center: TvPosTheta; left: TvPosTheta; right: TvPosTheta; };

		for ( let s = 0; s <= spline.getLength(); s++ ) {

			const segment = spline.segmentMap.findAt( s );

			if ( segment instanceof TvRoad ) {
				roadWidth = RoadWidthService.instance.findRoadWidthAt( segment, s - segment.sStart );
			}

			if ( !roadWidth ) {
				Log.error( 'Road width not found at ', s, spline.toString() );
				continue;
			}

			const center = spline.getCoordAtOffset( s );
			const left = center.clone().addLateralOffset( roadWidth.leftSideWidth + BUFFER );
			const right = center.clone().addLateralOffset( -roadWidth.rightSideWidth - BUFFER );

			const centerPoint = new SimpleControlPoint( null, center.position );
			const leftPoint = new SimpleControlPoint( null, left.position );
			const rightPoint = new SimpleControlPoint( null, right.position );

			spline.leftPoints.push( leftPoint );
			spline.centerPoints.push( centerPoint );
			spline.rightPoints.push( rightPoint );

			if ( startPoints === null ) {
				startPoints = { center, left, right };
			}

			endPoints = { center, left, right };

			boundingBox.expandByPoint( center.toVector2() );
			boundingBox.expandByPoint( left.toVector2() );
			boundingBox.expandByPoint( right.toVector2() );

		}

		if ( startPoints ) {

			const direction = startPoints.center.toDirectionVector().normalize().negate();
			const extenedPoint = startPoints.center.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedLeft = startPoints.left.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedRight = startPoints.right.position.add( direction.multiplyScalar( BUFFER ) );

			// add points at start of array
			spline.leftPoints.unshift( new SimpleControlPoint( null, extenedLeft ) );
			spline.centerPoints.unshift( new SimpleControlPoint( null, extenedPoint ) );
			spline.rightPoints.unshift( new SimpleControlPoint( null, extenedRight ) );

			boundingBox.expandByPoint( new Vector2( extenedPoint.x, extenedPoint.y ) );
			boundingBox.expandByPoint( new Vector2( extenedLeft.x, extenedLeft.y ) );
			boundingBox.expandByPoint( new Vector2( extenedRight.x, extenedRight.y ) );

		}

		if ( endPoints ) {

			const direction = endPoints.center.toDirectionVector().normalize();
			const extenedPoint = endPoints.center.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedLeft = endPoints.left.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedRight = endPoints.right.position.add( direction.multiplyScalar( BUFFER ) );

			// add points at end of array
			spline.leftPoints.push( new SimpleControlPoint( null, extenedLeft ) );
			spline.centerPoints.push( new SimpleControlPoint( null, extenedPoint ) );
			spline.rightPoints.push( new SimpleControlPoint( null, extenedRight ) );

			boundingBox.expandByPoint( new Vector2( extenedPoint.x, extenedPoint.y ) );
			boundingBox.expandByPoint( new Vector2( extenedLeft.x, extenedLeft.y ) );
			boundingBox.expandByPoint( new Vector2( extenedRight.x, extenedRight.y ) );
		}

		spline.boundingBox.copy( boundingBox );

	}
}
