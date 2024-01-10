import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvRoadLinkChildType } from "app/modules/tv-map/models/tv-road-link-child";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";
import { MapService } from "app/services/map.service";
import { RoadElevationService } from "app/services/road/road-elevation.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadService } from "app/services/road/road.service";
import { RoadObjectService } from "app/tools/marking-line/road-object.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private linkService: RoadLinkService,
		private roadFactory: RoadFactory,
		private roadService: RoadService,
		private roadElevationService: RoadElevationService,
		private roadObjectService: RoadObjectService,
	) { }

	addRoad ( road: TvRoad ) {

		this.roadService.addRoad( road );

		// this.roadLinkService.addLinks( event.road );

		this.roadElevationService.createDefaultNodes( road );

		this.mapService.setRoadOpacity( road );

	}

	removeRoad ( road: TvRoad ) {

		this.linkService.removeLinks( road );

		this.mapService.map.removeSpline( road.spline );

		this.roadFactory.idRemoved( road.id );

		this.mapService.map.removeRoad( road );

		this.mapService.map.gameObject.remove( road.gameObject );

	}

	updateRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		this.buildRoad( road );

		this.updateRoadBoundingBox( road );

		this.syncElevation( road );

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

	private syncElevation ( road: TvRoad ): void {

		this.roadElevationService.createDefaultNodes( road );

		if ( road.elevationProfile.getElevationCount() < 2 ) return;

		const lastIndex = road.elevationProfile.elevation.length - 1;

		const lastElevationNode = road.elevationProfile.elevation[ lastIndex ];

		lastElevationNode.s = road.length;

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			this.roadElevationService.createDefaultNodes( successor );

			const firstSuccessorElevation = successor.elevationProfile.elevation[ 0 ];

			firstSuccessorElevation.a = road.getElevationValue( road.length );

			TvUtils.computeCoefficients( successor.elevationProfile.elevation, successor.length );
		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			this.roadElevationService.createDefaultNodes( predecessor );

			const lastPredecessorElevation = predecessor.elevationProfile.elevation[ predecessor.elevationProfile.elevation.length - 1 ];

			lastPredecessorElevation.a = road.getElevationValue( 0 );

			TvUtils.computeCoefficients( predecessor.elevationProfile.elevation, predecessor.length );

		}

	}

	private buildLinks ( road: TvRoad ) {

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			if ( road.spline == successor.spline ) return;

			this.roadService.rebuildRoad( successor );

		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			if ( road.spline == predecessor.spline ) return;

			this.roadService.rebuildRoad( predecessor );

		}
	}

	private buildRoad ( road: TvRoad ) {

		this.roadService.rebuildRoad( road );

	}


}
