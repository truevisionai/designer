/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BufferGeometry, Line, LineBasicMaterial, Shape } from 'three';
import { AbstractSpline } from '../shapes/abstract-spline';
import { AutoSpline } from '../shapes/auto-spline';
import { AutoSplinePath, ExplicitSplinePath } from '../shapes/cubic-spline-curve';
import { ExplicitSpline } from '../shapes/explicit-spline';

@Injectable( {
	providedIn: 'root'
} )
export class LanePathFactory {

	static create (
		incomingRoad: TvRoad,
		connectingRoad: TvRoad,
		connection: TvJunctionConnection,
		link: TvJunctionLaneLink
	) {

		// const pathObject = new LanePathObject( incomingRoad, connectingRoad, connection, link );

		// const lane = connectingRoad.getLaneSectionAt( 0 ).getLaneById( link.to );

		// const width = connectingRoad.getLaneSectionAt( 0 ).getWidthUptoCenter( lane, 0 );

		// const spline = connectingRoad.spline;

		// const shape = new Shape();
		// shape.moveTo( 0, -0.3 );
		// shape.lineTo( 0, 0.3 );

		// if ( spline.controlPointPositions.length < 2 ) return;

		// let offset = width;

		// if ( lane.id < 0 ) offset *= -1;

		// const path = this.getPath( spline, offset );

		// const lineMaterial = new LineBasicMaterial( {
		// 	color: 0x00ffff,
		// 	linewidth: 100,
		// 	opacity: 0.5,
		// 	transparent: true,
		// } );

		// const lineGeometry = new BufferGeometry().setFromPoints( path.getSpacedPoints( 50 ) );

		// pathObject.mesh = new Line( lineGeometry, lineMaterial );

		// pathObject.mesh.castShadow = true;

		// pathObject.mesh.renderOrder = 3;

		// pathObject.mesh.frustumCulled = false;

		// pathObject.mesh[ 'tag' ] = LanePathObject.tag;

		// pathObject.add( pathObject.mesh );

		// return pathObject;
	}

	/**
	 *
	 * @param connectingRoad
	 * @deprecated dont use this
	 */
	static createFromConnectingRoad ( connectingRoad: TvRoad ) {

		// const pathObject = new LanePathObject( null, connectingRoad, null, null );

		// let lane = connectingRoad.getFirstLaneSection().getLaneById( 1 );

		// if ( !lane ) lane = connectingRoad.getFirstLaneSection().getLaneById( -1 );

		// const width = connectingRoad.getFirstLaneSection().getWidthUptoCenter( lane, 0 );

		// const spline = connectingRoad.spline;

		// const shape = new Shape();
		// shape.moveTo( 0, -0.3 );
		// shape.lineTo( 0, 0.3 );

		// if ( spline.controlPointPositions.length < 2 ) return;

		// let offset = width;

		// if ( lane.id < 0 ) offset *= -1;

		// const path = this.getPath( spline, offset );

		// const lineMaterial = new LineBasicMaterial( {
		// 	color: 0x00ffff,
		// 	linewidth: 100,
		// 	opacity: 0.5,
		// 	transparent: true,
		// } );

		// const lineGeometry = new BufferGeometry().setFromPoints( path.getSpacedPoints( 50 ) );

		// pathObject.mesh = new Line( lineGeometry, lineMaterial );

		// pathObject.mesh.castShadow = true;

		// pathObject.mesh.renderOrder = 3;

		// pathObject.mesh.frustumCulled = false;

		// pathObject.mesh[ 'tag' ] = LanePathObject.tag;

		// pathObject.add( pathObject.mesh );

		// return pathObject;
	}

	static update ( pathObject: LanePathObject ) {

		pathObject.update()

	}

	private static getPath ( spline: AbstractSpline, offset: number ) {

		if ( spline instanceof AutoSpline ) {

			return new AutoSplinePath( spline, offset );

		} else if ( spline instanceof ExplicitSpline ) {

			return new ExplicitSplinePath( spline, offset );

		}
	}
}
