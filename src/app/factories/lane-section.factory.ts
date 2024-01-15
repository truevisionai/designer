import { Injectable } from "@angular/core";
import { RoadNode } from "app/modules/three-js/objects/road-node";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { TvJunctionConnection } from "app/modules/tv-map/models/junctions/tv-junction-connection";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvLaneCoord } from "app/modules/tv-map/models/tv-lane-coord";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";
import { LaneLinkService } from "app/services/junction/lane-link.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneSectionFactory {

	constructor (
		private laneLinkService: LaneLinkService
	) { }

	createSuccessorLaneSection ( road: TvRoad ) {

	}

	createFromRoadNode ( joiningRoad: TvRoad, firstNode: RoadNode, secondNode: RoadNode ): TvLaneSection[] {

		const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, joiningRoad );

		return [ laneSection ];

	}

	createFromRoadCoord ( newRoad: TvRoad, previous: TvRoadCoord, next: TvRoadCoord ): TvLaneSection[] {

		// const incomingDirection = this.laneLinkService.determineDirection( previous.contact );
		// const outgoingDirection = this.laneLinkService.determineOutgoingDirection( previous, next );

		// const incomingLaneCoords = previous.laneSection.getLaneArray().filter( lane => lane.direction === incomingDirection ).map( lane => previous.toLaneCoord( lane ) );
		// const outgoingLaneCoords = next.laneSection.getLaneArray().filter( lane => lane.direction === outgoingDirection ).map( lane => next.toLaneCoord( lane ) );

		// const roadLength = newRoad.getRoadLength();

		if ( false && previous.laneSection.isMatching( next.laneSection ) ) {

			const laneSection = previous.laneSection.cloneAtS( 0, 0, null, newRoad );

			const lanes = laneSection.getLaneArray();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( previous.contact == TvContactPoint.END ) {

					lane.predecessor = previous.laneSection.getNearestLane( lane )?.id;

				} else {

					lane.predecessor = -previous.laneSection.getNearestLane( lane )?.id;

				}

				if ( next.contact == TvContactPoint.START ) {

					lane.successor = next.laneSection.getNearestLane( lane )?.id;

				} else {

					lane.successor = -next.laneSection.getNearestLane( lane )?.id;

				}

			}

			return [ laneSection ];

		} else {

			const laneSection = this.createLaneSection( newRoad );

			const prevLanes = previous.laneSection.getLaneArray();
			const nextLanes = next.laneSection.getLaneArray();

			const laneCount = Math.max(
				previous.laneSection.lanes.size,
				next.laneSection.lanes.size
			);

			const leftLanes = previous.laneSection.getLeftLaneCount() >= next.laneSection.getLeftLaneCount() ?
				previous.laneSection.getLeftLanes() :
				next.laneSection.getLeftLanes();

			const rightLanes = previous.laneSection.getRightLaneCount() >= next.laneSection.getRightLaneCount() ?
				previous.laneSection.getRightLanes() :
				next.laneSection.getRightLanes();

			laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

			for ( let i = 0; i < leftLanes.length; i++ ) {

				laneSection.addLane( TvLaneSide.LEFT, leftLanes[ i ].id, leftLanes[ i ].type, false, false );

			}

			for ( let i = 0; i < rightLanes.length; i++ ) {

				laneSection.addLane( TvLaneSide.RIGHT, rightLanes[ i ].id, rightLanes[ i ].type, false, false );

			}

			laneSection.sortLanes();

			for ( const lane of laneSection.lanes.values() ) {

				if ( lane.id == 0 ) continue;

				const prevLane = previous.laneSection.getNearestLane( lane );
				const nextLane = next.laneSection.getNearestLane( lane );

				if ( previous.contact == TvContactPoint.END && prevLane ) {

					lane.predecessor = prevLane?.id;

				} else if ( prevLane ) {

					lane.predecessor = -prevLane?.id;

				}

				if ( next.contact == TvContactPoint.START && nextLane ) {

					lane.successor = nextLane?.id;

				} else if ( nextLane ) {

					lane.successor = -nextLane?.id;

				}

				if ( !prevLane && !nextLane ) {

					// laneSection.removeLane( lane );

				}

			}

			return [ laneSection ];
		}

	}

	getIncomingLanes ( predecessor: TvRoadCoord ): TvLaneCoord[] {

		const incomingDirection = this.laneLinkService.determineDirection( predecessor.contact );

		return predecessor.laneSection.getLaneArray()
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => predecessor.toLaneCoord( lane ) );

	}

	/**
	 * Creates a lane section for a connecting road.
	 * Only right lanes are created.
	 */
	createForConnectingRoad ( connectingRoad: TvRoad, predecessor: TvRoadCoord, successor: TvRoadCoord ): TvLaneSection[] {

		const laneSection = this.createLaneSection( connectingRoad );

		const incomingDirection = this.laneLinkService.determineDirection( predecessor.contact );
		const outgoingDirection = this.laneLinkService.determineOutgoingDirection( predecessor, successor );

		const incomingLaneCoords = predecessor.laneSection.getLaneArray()
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => predecessor.toLaneCoord( lane ) )

		const outgoingLaneCoords = successor.laneSection.getLaneArray()
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => successor.toLaneCoord( lane ) )

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const coords = incomingLaneCoords.length >= outgoingLaneCoords.length ?
			incomingLaneCoords :
			outgoingLaneCoords;

		let id = 0;

		if ( incomingDirection == 'forward' ) {
			coords.sort( ( a, b ) => a.lane.id > b.lane.id ? -1 : 1 );
		} else {
			coords.sort( ( a, b ) => a.lane.id > b.lane.id ? 1 : -1 );
		}

		for ( let i = 0; i < coords.length; i++ ) {

			const coord = coords[ i ];

			const prevLane = TvLaneSection.getNearestLane( incomingLaneCoords.map( i => i.lane ), coord.lane );

			const nextLane = TvLaneSection.getNearestLane( outgoingLaneCoords.map( i => i.lane ), coord.lane );

			if ( prevLane && nextLane ) {

				id++;

				const lane = laneSection.addLane(
					TvLaneSide.RIGHT,
					-id,
					coord.lane.type,
					true,
					true
				);

				if ( prevLane ) {
					lane.predecessor = prevLane.id;
				}

				if ( nextLane ) {
					lane.successor = nextLane.id;
				}

				lane.width.splice( 0, lane.width.length );

				const widhtAtStart = prevLane?.getWidthValue( 0 ) || 0;

				const widthAtEnd = nextLane?.getWidthValue( 0 ) || 0;

				lane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

				lane.addWidthRecord( connectingRoad.length, widthAtEnd, 0, 0, 0 );

				TvUtils.computeCoefficients( lane.width, connectingRoad.length );

			}
		}

		laneSection.sortLanes();

		// update id
		// const lanes = laneSection.getLaneArray();
		// for ( let i = 0; i < lanes.length; i++ ) {
		// 	lanes[ i ].id = -i;
		// }

		return [ laneSection ];

	}

	/**
	 *
	 * @param connection
	 * @param predecessor
	 * @param successor
	 * @returns
	 * @deprecated not working
	 */
	createForSingleManeuver ( connection: TvJunctionConnection, predecessor: TvRoadCoord, successor: TvRoadCoord ): TvLaneSection {

		const laneSection = this.createLaneSection( connection.connectingRoad );

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const maneuverLane = laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.none, false, false );

		const predecessorLane = predecessor.laneSection.getNearestLane( maneuverLane );
		const successorLane = successor.laneSection.getNearestLane( maneuverLane );

		if ( predecessorLane || successorLane ) {
			maneuverLane.type = predecessorLane?.type || successorLane?.type;
		}

		if ( predecessorLane ) {
			maneuverLane.predecessor = predecessorLane?.id
		}

		if ( successorLane ) {
			maneuverLane.successor = successorLane?.id
		}

		return laneSection;

	}

	private createLaneSection ( road: TvRoad ) {

		return new TvLaneSection( road.laneSections.length, 0, false, road );

	}

}
