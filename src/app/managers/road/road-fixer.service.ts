import { Injectable } from '@angular/core';
import { Log } from 'app/core/utils/log';
import { TvRoadLink } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapService } from 'app/services/map/map.service';
import { RoadUtils } from 'app/utils/road.utils';

@Injectable( {
	providedIn: 'root'
} )
export class RoadFixerService {

	private debug = true;

	constructor ( private map: MapService ) { }

	fix ( road: TvRoad ) {

		if ( road.successor ) this.fixSuccessor( road, road.successor );

		if ( road.predecessor ) this.fixPredecessor( road, road.predecessor );

	}

	fixSuccessor ( road: TvRoad, link: TvRoadLink ) {

		if ( link.isJunction ) return;

		if ( this.map.map.roads.has( link.element.id ) ) return;

		if ( this.debug ) Log.error( "Unlink Successor not found", road.toString(), link.toString() );

		RoadUtils.unlinkSuccessor( road );

		road.spline.segmentMap.remove( link.element );

	}

	fixPredecessor ( road: TvRoad, link: TvRoadLink ) {

		if ( link.isJunction ) return;

		if ( this.map.map.roads.has( link.element.id ) ) return;

		if ( this.debug ) Log.error( "Unlink Predecessor not found", road.toString(), link.toString() );

		RoadUtils.unlinkPredecessor( road );

		road.spline.segmentMap.remove( link.element );

	}

}
