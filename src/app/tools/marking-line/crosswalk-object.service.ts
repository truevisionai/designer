import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Crosswalk } from "../../modules/tv-map/models/objects/crosswalk";
import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkObjectService {

	constructor (
		public base: BaseToolService,
		private map: MapService
	) { }

	addCrosswalk ( road: TvRoad, crosswalk: Crosswalk ) {

		road.gameObject.add( crosswalk );

		road.addRoadObjectInstance( crosswalk );

	}

	removeCrosswalk ( road: TvRoad, crosswalk: Crosswalk ) {

		road.gameObject.remove( crosswalk );

		road.removeRoadObjectById( crosswalk.attr_id );

	}

	addCornerRoad ( crosswalk: Crosswalk, cornerRoad: TvCornerRoad ) {

		crosswalk.addCornerRoad( cornerRoad );

	}

	removeCornerRoad ( crosswalk: Crosswalk, cornerRoad: TvCornerRoad ) {

		crosswalk.removeCornerRoad( cornerRoad );

	}


	showRoad ( road: TvRoad ) {

		road.getRoadObjects().forEach( object => {

			object.outlines.forEach( outline => {

				outline.cornerRoad.forEach( corner => {

					corner.show();

				} );
			} );

		} );

	}

	hideRoad ( road: TvRoad ) {

		road.getRoadObjects().forEach( object => {

			object.outlines.forEach( outline => {

				outline.cornerRoad.forEach( corner => {

					corner.hide();

				} );

			} );

		} );

	}

	showMarkingObjects () {

		this.map.map.getRoads().forEach( road => {

			this.showRoad( road );

		} );

	}

	hideMarkingObjects () {

		this.map.map.getRoads().forEach( road => {

			this.hideRoad( road );

		} );
	}
}
