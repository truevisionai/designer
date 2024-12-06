/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDataService } from "../../core/interfaces/data.service";
import { PropPolygon } from "./prop-polygon.model";
import { MapService } from "../../services/map/map.service";
import { PolygonDistributionService } from '../builders/polygon-distribution.service';
import { TvTransform } from '../models/tv-transform';
import { Euler, Vector3 } from 'three';
import { SplineGeometryGenerator } from "../../services/spline/spline-geometry-generator";
import { MapEvents } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonService extends BaseDataService<PropPolygon> {

	constructor (
		private mapService: MapService,
		private splineBuilder: SplineGeometryGenerator,
	) {
		super();
	}

	add ( object: PropPolygon ): void {

		this.mapService.addPropPolygon( object );

		this.updatePositions( object );

		this.build( object );

	}

	all (): PropPolygon[] {

		return this.mapService.map.propPolygons;

	}

	remove ( polygon: PropPolygon ): void {

		this.mapService.removePropPolygon( polygon );

		MapEvents.propPolygonRemoved.emit( polygon );

	}

	update ( polygon: PropPolygon ): void {

		this.updatePositions( polygon );

		this.build( polygon );

	}

	build ( object: PropPolygon ): void {

		this.splineBuilder.buildCatmullRom( object.spline );

		MapEvents.propPolygonUpdated.emit( object );

	}

	updatePositions ( polygon: PropPolygon ): void {

		if ( !polygon ) return;

		if ( polygon.spline?.getControlPointCount() < 3 ) return;

		const positions = PolygonDistributionService.distributePoints( polygon.spline.getControlPoints().map( cp => cp.position ), polygon.density );

		const propGuid = polygon.props.length > 0 ? polygon.props[ 0 ].guid : polygon.propGuid;

		polygon.props = [];

		for ( let i = 0; i < positions.length; i++ ) {

			const transform = new TvTransform( positions[ i ], new Euler(), new Vector3() );

			polygon.addTransform( propGuid, transform );

		}

	}

}
