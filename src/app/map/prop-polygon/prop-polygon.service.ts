/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDataService } from "../../core/interfaces/data.service";
import { PropPolygon } from "./prop-polygon.model";
import { MapService } from "../../services/map/map.service";
import { PropPolygonBuilder } from "./prop-polygon.builder";
import { PolygonDistributionService } from '../builders/polygon-distribution.service';
import { TvTransform } from '../models/tv-transform';
import { Euler, Vector3 } from 'three';
import { SplineBuilder } from "../../services/spline/spline.builder";

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonService extends BaseDataService<PropPolygon> {

	constructor (
		private mapService: MapService,
		private builder: PropPolygonBuilder,
		private splineBuilder: SplineBuilder,
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

		this.mapService.map.propPolygonsGroup.remove( polygon );

	}

	update ( polygon: PropPolygon ): void {

		this.updatePositions( polygon );

		this.build( polygon );

	}

	private build ( object: PropPolygon ) {

		this.splineBuilder.buildCatmullRom( object.spline );

		if ( object.spline.controlPoints.length < 3 ) return;

		const mesh = this.builder.build( object );

		this.mapService.map.propPolygonsGroup.add( object, mesh );

	}

	private updatePositions ( polygon: PropPolygon ) {

		if ( !polygon ) return;

		if ( polygon.spline?.controlPoints?.length < 3 ) return;

		const positions = PolygonDistributionService.distributePoints( polygon.spline.controlPoints.map( cp => cp.position ), polygon.density );

		const propGuid = polygon.props.length > 0 ? polygon.props[ 0 ].guid : polygon.propGuid;

		polygon.props = [];

		for ( let i = 0; i < positions.length; i++ ) {

			const transform = new TvTransform( positions[ i ], new Euler(), new Vector3() );

			polygon.addTransform( propGuid, transform );

		}

	}

}
