/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadElevationControlPoint } from 'app/objects/road-elevation-node';
import { TvElevation } from 'app/map/models/tv-elevation';
import { TvRoad } from 'app/map/models/tv-road.model';
import { DebugLine } from 'app/objects/debug-line';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { Object3DMap } from '../../core/models/object3d-map';
import { RoadElevationService } from 'app/services/road/road-elevation.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationToolService {

	private nodes = new Object3DMap<TvElevation, RoadElevationControlPoint>();
	private lines = new Object3DMap<TvElevation, DebugLine<TvElevation>>();

	constructor (
		public base: BaseToolService,
		public debug: RoadDebugService,
		public elevationService: RoadElevationService,
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

		this.elevationService.removeElevation( road, node );

		this.nodes.remove( node );

		this.lines.remove( node );

	}

	updateElevationNode ( road: TvRoad, node: RoadElevationControlPoint, position: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( position );

		node.elevation.s = roadCoord.s;

		this.updateElevation( road, node.elevation );

	}

	updateElevation ( road: TvRoad, elevation: TvElevation ) {

		this.elevationService.updateElevation( road, elevation );

		this.updateControlPoints( road );

	}

	addElevation ( road: TvRoad, elevation: TvElevation ) {

		this.elevationService.addElevation( road, elevation );

		this.updateControlPoints( road );

	}

	private createElevationNode ( road: TvRoad, elevation: TvElevation ): RoadElevationControlPoint {

		return new RoadElevationControlPoint( road, elevation );

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
