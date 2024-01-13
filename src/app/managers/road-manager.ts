import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { MapService } from "app/services/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadService } from "app/services/road/road.service";
import { RoadObjectService } from "app/tools/marking-line/road-object.service";
import { RoadElevationManager } from "./road-elevation.manager";
import { LaneManager } from "./lane/lane.manager";
import { RoadBuilder } from "app/modules/tv-map/builders/road.builder";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private linkService: RoadLinkService,
		private roadFactory: RoadFactory,
		private roadObjectService: RoadObjectService,
		private roadElevationManager: RoadElevationManager,
		private laneManager: LaneManager,
		private roadBuilder: RoadBuilder,
	) { }

	addRoad ( road: TvRoad ) {

		for ( const laneSection of road.laneSections ) {
			for ( const [ id, lane ] of laneSection.lanes ) {
				this.laneManager.onLaneCreated( lane );
			}
		}

		this.roadElevationManager.onRoadCreated( road );

		this.mapService.setRoadOpacity( road );

		this.buildRoad( road );

	}

	removeRoad ( road: TvRoad ) {

		this.linkService.removeLinks( road );

		// we only want to remove the segment not the whole spline
		// this.mapService.map.removeSpline( road.spline );

		this.roadFactory.idRemoved( road.id );

		this.mapService.map.removeRoad( road );

		this.mapService.map.gameObject.remove( road.gameObject );

	}

	updateRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadElevationManager.onRoadUpdated( road );

		this.buildRoad( road );

		this.updateRoadBoundingBox( road );

		this.buildLinks( road );

		this.updateRoadObjects( road );

		this.mapService.setRoadOpacity( road );

	}

	private updateRoadBoundingBox ( road: TvRoad ) {

		road.computeBoundingBox();

	}

	private updateRoadObjects ( road: TvRoad ): void {

		this.roadObjectService.updateRoadObjectPositions( road );

	}

	private buildLinks ( road: TvRoad ) {

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			if ( road.spline == successor.spline ) return;

			this.roadBuilder.rebuildRoad( successor );

		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			if ( road.spline == predecessor.spline ) return;

			this.roadBuilder.rebuildRoad( predecessor );

		}
	}

	private buildRoad ( road: TvRoad ) {

		this.roadBuilder.rebuildRoad( road );

		// or
		return;

		const segment = road.spline.findSegment( road );

		if ( !segment ) return;

		road.clearGeometries();

		if ( segment.geometries.length == 0 ) return;

		segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

		this.roadBuilder.rebuildRoad( road );

	}

}
