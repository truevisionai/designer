/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IntersectionGroup } from "app/managers/Intersection-group";
import {
	TvJunctionSegmentBoundary
} from "app/map/junction-boundary/tv-junction-boundary";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint, TvLaneSide } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";
import { Vector3 } from "three";
import { TvJunctionConnection } from "../map/models/connections/tv-junction-connection";
import { TvJunctionLaneLink } from "../map/models/junctions/tv-junction-lane-link";
import { TvLink } from "../map/models/tv-link";
import { TvLane } from "app/map/models/tv-lane";
import { LaneUtils } from "./lane.utils";
import { Log } from "app/core/utils/log";
import { TvLaneBoundary } from "../map/junction-boundary/tv-lane-boundary";
import { TvJointBoundary } from "../map/junction-boundary/tv-joint-boundary";

export class JunctionUtils {

	private static findConnectionsOf ( junction: TvJunction, road: TvRoad ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		for ( const connection of junction.getConnections() ) {

			if ( connection.incomingRoad == road ) {

				connections.push( connection );

			} else {

				const link = connection.contactPoint == TvContactPoint.START ?
					connection.connectingRoad.successor :
					connection.connectingRoad.predecessor;

				if ( link && link.element == road ) {

					connections.push( connection );

				}

			}

		}

		return connections

	}

	private static findConnectionsFrom ( junction: TvJunction, from: TvRoad, to: TvRoad ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		for ( const connection of junction.getConnections() ) {

			if ( connection.incomingRoad == from ) {

				const link = connection.contactPoint == TvContactPoint.START ?
					connection.connectingRoad.successor :
					connection.connectingRoad.predecessor;

				if ( link && link.element == to ) {

					connections.push( connection );

				}

			}

		}

		return connections;

	}

	private static findConnectionsBetween ( junction: TvJunction, incoming: TvRoad, outgoing: TvRoad ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		for ( const connection of junction.getConnections() ) {

			if ( connection.incomingRoad == incoming ) {

				const link = connection.contactPoint == TvContactPoint.START ?
					connection.connectingRoad.successor :
					connection.connectingRoad.predecessor;

				if ( link && link.element == outgoing ) {

					connections.push( connection );

				}

			} else if ( connection.incomingRoad == outgoing ) {

				const link = connection.contactPoint == TvContactPoint.START ?
					connection.connectingRoad.successor :
					connection.connectingRoad.predecessor;

				if ( link && link.element == incoming ) {

					connections.push( connection );

				}

			}

		}

		return connections;

	}

	static getLaneLinks ( junction: TvJunction ): TvJunctionLaneLink[] {

		const links: TvJunctionLaneLink[] = [];

		for ( const connection of junction.getConnections() ) {

			for ( const laneLink of connection.getLaneLinks() ) {

				links.push( laneLink );

			}

		}

		return links;

	}

	static findLinksBetween ( junction: TvJunction, incoming: TvRoad, outgoing: TvRoad ): TvJunctionLaneLink[] {

		const links: TvJunctionLaneLink[] = [];

		const connections = this.findConnectionsBetween( junction, incoming, outgoing );

		for ( const connection of connections ) {

			for ( const laneLink of connection.getLaneLinks() ) {

				links.push( laneLink );

			}

		}

		return links;
	}

	static findLinksFrom ( junction: TvJunction, from: TvRoad, to: TvRoad ): TvJunctionLaneLink[] {

		const links: TvJunctionLaneLink[] = [];

		const connections = this.findConnectionsFrom( junction, from, to );

		for ( const connection of connections ) {

			for ( const laneLink of connection.getLaneLinks() ) {

				links.push( laneLink );

			}

		}

		return links;
	}

	static findSuccessors ( road: TvRoad, targetLane: TvLane, link: TvLink ): TvLane[] {

		if ( !link ) return [];

		const successors: TvLane[] = []

		if ( link.element instanceof TvJunction ) {

			const connections = this.findConnectionsOf( link.element, road );

			for ( const connection of connections ) {

				for ( const laneLink of connection.getLaneLinks() ) {

					if ( laneLink.incomingLane.uuid == targetLane.uuid ) {

						successors.push( laneLink.connectingLane );

					} else {

						if ( laneLink.connectingLane.isSuccessor( targetLane ) ) {

							successors.push( laneLink.connectingLane );

						} else if ( laneLink.connectingLane.isPredecessor( targetLane ) ) {

							successors.push( laneLink.connectingLane );

						}

					}

				}

			}

		} else if ( link.element instanceof TvRoad ) {

			if ( targetLane.successorExists ) {

				const laneSection = road.getLaneProfile().getLastLaneSection();

				const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

				if ( !nextLaneSection ) return [];

				const nextLane = nextLaneSection.getLaneById( targetLane.successorId );

				if ( nextLane ) {
					successors.push( nextLane );
				}

				return successors;
			}

		}

		return successors;

	}

	static findPredecessors ( road: TvRoad, targetLane: TvLane, link: TvLink ): TvLane[] {

		if ( !link ) return [];

		const predecessors: TvLane[] = []

		if ( link.element instanceof TvJunction ) {

			const connections = this.findConnectionsOf( link.element, road );

			for ( const connection of connections ) {

				for ( const laneLink of connection.getLaneLinks() ) {

					if ( laneLink.incomingLane.uuid == targetLane.uuid ) {

						predecessors.push( laneLink.connectingLane );

					} else {

						if ( laneLink.connectingLane.isSuccessor( targetLane ) ) {

							predecessors.push( laneLink.connectingLane );

						} else if ( laneLink.connectingLane.isPredecessor( targetLane ) ) {

							predecessors.push( laneLink.connectingLane );

						}

					}

				}

			}

		} else if ( link.element instanceof TvRoad ) {

			if ( targetLane.predecessorExists ) {

				const laneSection = road.getLaneProfile().getFirstLaneSection();

				const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );

				if ( !prevLaneSection ) return [];

				const prevLane = prevLaneSection.getLaneById( targetLane.predecessorId );

				if ( prevLane ) {
					predecessors.push( prevLane );
				}

				return predecessors;
			}

		}

		return predecessors;

	}

	static generateJunctionHash ( junction: TvJunction ): string {

		const splineIds = junction.getIncomingSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ splineIds }`;

		return hash;
	}

	static generateGroupHash ( group: IntersectionGroup ): string {

		const spline = group.getSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ spline }`;

		return hash;
	}

	static findConnectionFromLink ( junction: TvJunction, link: TvJunctionLaneLink ): any {

		for ( const connection of junction.getConnections() ) {

			for ( const laneLink of connection.getLaneLinks() ) {

				if ( laneLink == link ) {

					return connection;

				}

			}

		}

		return null;
	}
}
