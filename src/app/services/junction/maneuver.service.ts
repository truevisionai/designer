import { Injectable } from '@angular/core';
import { RoadFactory } from 'app/factories/road-factory.service';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { RoadSplineService } from '../road/road-spline.service';

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverService {

	private roadSplineService: RoadSplineService;

	constructor () {

		this.roadSplineService = new RoadSplineService();

	}

	createConnectingRoad ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide ) {

		const laneWidth = entry.lane.getWidthValue( 0 );

		// const spline = this.createSpline( entry, exit, side );

		// const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

		// // this.map.addRoad( connectingRoad );

		// connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );

		// connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );

		// // TODO: test this
		// connectingRoad.laneSections.forEach( ( laneSection ) => {

		// 	laneSection.lanes.forEach( ( lane ) => {

		// 		lane.predecessor = entry.lane.id;
		// 		lane.successor = exit.lane.id;

		// 	} );
		// } );

		// connectingRoad.spline = spline;

		// connectingRoad.updateGeometryFromSpline();

		// connectingRoad.spline.hide();

		// return connectingRoad;
	}

	// createConnectingRoad ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide, junction: TvJunction ) {

	// 	const laneWidth = entry.lane.getWidthValue( 0 );

	// 	const spline = this.createSpline( entry, exit, side );

	// 	const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

	// 	this.map.addRoad( connectingRoad );

	// 	connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );

	// 	connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );

	// 	// TODO: test this
	// 	connectingRoad.laneSections.forEach( ( laneSection ) => {

	// 		laneSection.lanes.forEach( ( lane ) => {

	// 			lane.predecessor = entry.lane.id;
	// 			lane.successor = exit.lane.id;

	// 		} );
	// 	} );

	// 	connectingRoad.spline = spline;

	// 	connectingRoad.updateGeometryFromSpline();

	// 	connectingRoad.spline.hide();

	// 	return connectingRoad;
	// }


}
