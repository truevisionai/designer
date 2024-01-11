import { Injectable } from "@angular/core";
import { RoadNode } from "app/modules/three-js/objects/road-node";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneSectionFactory {

	constructor () { }

	createSuccessorLaneSection ( road: TvRoad ) {

	}

	createLaneSections ( joiningRoad: TvRoad, firstNode: RoadNode, secondNode: RoadNode ): TvLaneSection[] {

		const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, joiningRoad );

		return [ laneSection ];

	}

}
