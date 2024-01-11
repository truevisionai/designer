import { Injectable } from "@angular/core";
import { RoadNode } from "app/modules/three-js/objects/road-node";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneSectionFactory {

	constructor () { }

	createSuccessorLaneSection ( road: TvRoad ) {

	}

	createFromRoadNode ( joiningRoad: TvRoad, firstNode: RoadNode, secondNode: RoadNode ): TvLaneSection[] {

		const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, joiningRoad );

		return [ laneSection ];

	}

	createFromRoadCoord ( newRoad: TvRoad, previous: TvRoadCoord, next: TvRoadCoord ): TvLaneSection[] {

		const roadLength = newRoad.getRoadLength();

		if ( previous.laneSection.isMatching( next.laneSection ) ) {

			const laneSection = previous.laneSection.cloneAtS( 0, 0, null, newRoad );

			const lanes = laneSection.getLaneArray();
			const prevLanes = previous.laneSection.getLaneArray();
			const nextLanes = next.laneSection.getLaneArray();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( previous.contact == TvContactPoint.END ) {

					lane.predecessor = prevLanes[ i ].id;

				} else {

					lane.predecessor = -prevLanes[ i ].id;

				}

				if ( next.contact == TvContactPoint.START ) {

					lane.successor = nextLanes[ i ].id;

				} else {

					lane.successor = -nextLanes[ i ].id;

				}


			}

			return [ laneSection ];

		}

		throw new Error( "Method not implemented." );

	}

}
