import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadElevationControlPoint } from 'app/modules/three-js/objects/road-elevation-node';
import { BaseToolService } from 'app/tools/base-tool.service';
import { Vector3 } from 'three';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { RoadDebugService } from '../debug/road-debug.service';
import { DebugLine } from '../debug/debug-line';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationService {

	private nodes = new Object3DMap<TvElevation, RoadElevationControlPoint>();
	private lines = new Object3DMap<TvElevation, DebugLine<TvElevation>>();

	constructor (
		public base: BaseToolService,
		public debug: RoadDebugService,
	) {
	}

	onToolDisabled () {

		this.nodes.clear();

		this.lines.clear();

		this.debug.clear();

	}

	showControlPoints ( road: TvRoad ) {

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng and end
			road.addElevation( 0, 0, 0, 0, 0 );
			road.addElevation( road.length, 0, 0, 0, 0 );

		}

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

	createElevation ( road: TvRoad, point: Vector3 ) {

		const roadCoord = road.getCoordAt( point );

		const elevation = road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		return elevation;

	}

	createElevationNode ( road: TvRoad, elevation: TvElevation ): RoadElevationControlPoint {

		return new RoadElevationControlPoint( road, elevation );
	}

	createElevationLine ( road: TvRoad, elevation: TvElevation ): DebugLine<TvElevation> {

		return this.debug.createRoadNode( road, elevation, elevation.s );

	}

	removeElevation ( road: TvRoad, node: TvElevation ) {

		this.nodes.remove( node );

		this.lines.remove( node );

		road.removeElevationInstance( node );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );
	}

	updateElevationNode ( road: TvRoad, node: RoadElevationControlPoint, position: Vector3 ) {

		const roadCoord = road.getCoordAt( position );

		node.elevation.s = roadCoord.s;

		this.updateElevation( road, node.elevation );

	}

	updateElevation ( road: TvRoad, elevation: TvElevation ) {

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.hideControlPoints( road );

		this.showControlPoints( road );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );

	}

	addElevation ( road: TvRoad, elevation: TvElevation ) {

		road.addElevationInstance( elevation );

		this.nodes.add( elevation, this.createElevationNode( road, elevation ) );

		this.lines.add( elevation, this.createElevationLine( road, elevation ) );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );
	}

}
