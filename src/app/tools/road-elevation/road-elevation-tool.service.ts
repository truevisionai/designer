/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ElevationControlPoint } from 'app/map/road-elevation/tv-elevation.object';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { DebugLine } from 'app/objects/debug-line';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { Object3DMap } from '../../core/models/object3d-map';
import { TvElevationService } from 'app/map/road-elevation/tv-elevation.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationToolService {

	private nodes = new Object3DMap<TvElevation, ElevationControlPoint>();
	private lines = new Object3DMap<TvElevation, DebugLine<TvElevation>>();

	constructor (
		public base: BaseToolService,
		public debug: RoadDebugService,
		public elevationService: TvElevationService,
	) {
	}

	onToolDisabled () {

		this.nodes.clear();

		this.lines.clear();

		this.debug.clear();

	}

	showControlPoints ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.add( elevation, this.createElevationNode( road, elevation ) );

			this.lines.add( elevation, this.createElevationLine( road, elevation ) );

		} );

	}

	hideControlPoints ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.remove( elevation );

			this.lines.remove( elevation );

		} );

	}

	removeElevation ( road: TvRoad, node: TvElevation ) {

		this.elevationService.remove( road, node );

		this.nodes.remove( node );

		this.lines.remove( node );

	}

	updateElevationNode ( road: TvRoad, node: ElevationControlPoint, position: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( position );

		node.elevation.s = roadCoord.s;

		this.updateElevation( road, node.elevation );

	}

	updateElevation ( road: TvRoad, elevation: TvElevation ) {

		this.elevationService.update( road, elevation );

		this.updateControlPoints( road );

	}

	addElevation ( road: TvRoad, elevation: TvElevation ) {

		this.elevationService.add( road, elevation );

		this.updateControlPoints( road );

	}

	private createElevationNode ( road: TvRoad, elevation: TvElevation ): ElevationControlPoint {

		return new ElevationControlPoint( road, elevation );

	}

	private createElevationLine ( road: TvRoad, elevation: TvElevation ): DebugLine<TvElevation> {

		return this.debug.createRoadNode( road, elevation, elevation.s );

	}

	private updateControlPoints ( road: TvRoad ) {

		this.hideControlPoints( road );

		this.showControlPoints( road );

		this.debug.clearLines();

		this.debug.highlightRoad( road );

	}

}
