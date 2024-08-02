import { IntersectionGroup } from "app/managers/Intersection-group";
import {
	TvJointBoundary,
	TvJunctionSegmentBoundary,
	TvLaneBoundary
} from "app/map/junction-boundary/tv-junction-boundary";
import { TvJunctionBoundaryBuilder } from "app/map/junction-boundary/tv-junction-boundary.builder";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint, TvLaneSide } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";
import { Vector3 } from "three";
import { Maths } from "./maths";
import { TvJunctionConnection } from "../map/models/junctions/tv-junction-connection";
import { TvJunctionLaneLink } from "../map/models/junctions/tv-junction-lane-link";
import { TvRoadLink } from "../map/models/tv-road-link";
import { TvLane } from "app/map/models/tv-lane";
import { LaneUtils } from "./lane.utils";

export class JunctionUtils {

	private static findConnectionsOf ( junction: TvJunction, road: TvRoad ) {

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

	private static findConnectionsFrom ( junction: TvJunction, from: TvRoad, to: TvRoad ) {

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

	private static findConnectionsBetween ( junction: TvJunction, incoming: TvRoad, outgoing: TvRoad ) {

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

	static getLaneLinks ( junction: TvJunction ) {

		const links: TvJunctionLaneLink[] = [];

		for ( const connection of junction.getConnections() ) {

			for ( const laneLink of connection.laneLink ) {

				links.push( laneLink );

			}

		}

		return links;

	}

	static findLinksBetween ( junction: TvJunction, incoming: TvRoad, outgoing: TvRoad ) {

		const links: TvJunctionLaneLink[] = [];

		const connections = this.findConnectionsBetween( junction, incoming, outgoing );

		for ( const connection of connections ) {

			for ( const laneLink of connection.laneLink ) {

				links.push( laneLink );

			}

		}

		return links;
	}

	static findLinksFrom ( junction: TvJunction, from: TvRoad, to: TvRoad ) {

		const links: TvJunctionLaneLink[] = [];

		const connections = this.findConnectionsFrom( junction, from, to );

		for ( const connection of connections ) {

			for ( const laneLink of connection.laneLink ) {

				links.push( laneLink );

			}

		}

		return links;
	}

	static findSuccessors ( road: TvRoad, targetLane: TvLane, link: TvRoadLink ) {

		if ( !link ) return [];

		const successors: TvLane[] = []

		if ( link.element instanceof TvJunction ) {

			const connections = this.findConnectionsOf( link.element, road );

			for ( const connection of connections ) {

				for ( const laneLink of connection.laneLink ) {

					if ( laneLink.incomingLane.uuid == targetLane.uuid ) {

						successors.push( laneLink.connectingLane );

					} else {

						if ( laneLink.connectingLane.successorUUID == targetLane.uuid ) {

							successors.push( laneLink.connectingLane );

						} else if ( laneLink.connectingLane.predecessorUUID == targetLane.uuid ) {

							successors.push( laneLink.connectingLane );

						}

					}

				}

			}

		} else if ( link.element instanceof TvRoad ) {

			if ( targetLane.successorExists ) {

				const laneSection = road.getLastLaneSection();

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

	static findPredecessors ( road: TvRoad, targetLane: TvLane, link: TvRoadLink ) {

		if ( !link ) return [];

		const predecessors: TvLane[] = []

		if ( link.element instanceof TvJunction ) {

			const connections = this.findConnectionsOf( link.element, road );

			for ( const connection of connections ) {

				for ( const laneLink of connection.laneLink ) {

					if ( laneLink.incomingLane.uuid == targetLane.uuid ) {

						predecessors.push( laneLink.connectingLane );

					} else {

						if ( laneLink.connectingLane.successorUUID == targetLane.uuid ) {

							predecessors.push( laneLink.connectingLane );

						} else if ( laneLink.connectingLane.predecessorUUID == targetLane.uuid ) {

							predecessors.push( laneLink.connectingLane );

						}

					}

				}

			}

		} else if ( link.element instanceof TvRoad ) {

			if ( targetLane.predecessorExists ) {

				const laneSection = road.getFirstLaneSection();

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

	static generateJunctionHash ( junction: TvJunction ) {

		const splineIds = junction.getIncomingSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ splineIds }`;

		return hash;
	}

	static generateGroupHash ( group: IntersectionGroup ) {

		const spline = group.getSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ spline }`;

		return hash;
	}

	static convetToPositions ( segment: TvJunctionSegmentBoundary ): Vector3[] {

		if ( segment instanceof TvLaneBoundary ) {

			return this.convertLaneToPositions( segment );

		} else if ( segment instanceof TvJointBoundary ) {

			return this.convertJointToPositions( segment );

		}

		throw new Error( 'Invalid segment type' );
	}

	static convertJointToPositions ( joint: TvJointBoundary ): Vector3[] {

		const posTheta = joint.road.getPosThetaByContact( joint.contactPoint );
		const roadWidth = joint.road.getRoadWidthAt( posTheta.s );
		const t = roadWidth.leftSideWidth - roadWidth.rightSideWidth;

		// return only 2 points for joint boundary

		let start: Vector3;

		if ( joint.contactPoint == TvContactPoint.START ) {

			start = joint.jointLaneStart.side == TvLaneSide.RIGHT ?
				joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3() :
				joint.road.getLaneStartPosition( joint.jointLaneStart, posTheta.s ).toVector3();

		} else if ( joint.contactPoint == TvContactPoint.END ) {

			start = joint.jointLaneStart.side == TvLaneSide.RIGHT ?
				joint.road.getLaneStartPosition( joint.jointLaneStart, posTheta.s ).toVector3() :
				joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3();

		}

		const mid = joint.road.getPosThetaAt( posTheta.s, t * 0.5 ).toVector3();

		let end: Vector3;

		if ( joint.contactPoint == TvContactPoint.START ) {

			end = joint.jointLaneEnd.side == TvLaneSide.RIGHT ?
				joint.road.getLaneStartPosition( joint.jointLaneEnd, posTheta.s ).toVector3() :
				joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

		} else if ( joint.contactPoint == TvContactPoint.END ) {

			end = joint.jointLaneEnd.side == TvLaneSide.RIGHT ?
				joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3() :
				joint.road.getLaneStartPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

		}

		return [ start, mid, end ];

		// const points: Vector3[] = []

		// for ( let t = 0; t < roadWidth.leftSideWidth; t++ ) {
		//
		// 	const point = joint.road.getPosThetaAt( posTheta.s, roadWidth.leftSideWidth - t ).toVector3();
		//
		// 	points.push( point );
		//
		// }
		//
		// for ( let t = 0; t < roadWidth.rightSideWidth; t++ ) {
		//
		// 	const point = joint.road.getPosThetaAt( posTheta.s, -1 * t ).toVector3();
		//
		// 	points.push( point );
		//
		// }

		// return points;
	}

	static convertLaneToPositions ( lane: TvLaneBoundary ): Vector3[] {

		const positions: Vector3[] = [];

		const start = this.findPosition( lane.road, lane.sStart );

		const end = this.findPosition( lane.road, lane.sEnd );

		// push first point
		positions.push( lane.road.getLaneEndPosition( lane.boundaryLane, start.s + Maths.Epsilon ).toVector3() );

		for ( let s = start.s; s <= end.s; s += 1 ) {

			const posTheta = lane.road.getPosThetaAt( s );

			const position = lane.road.getLaneEndPosition( lane.boundaryLane, posTheta.s ).toVector3();

			positions.push( position );

		}

		// push last point
		positions.push( lane.road.getLaneEndPosition( lane.boundaryLane, end.s - Maths.Epsilon ).toVector3() );

		return positions;


	}

	static findPosition ( road: TvRoad, value: number | TvContactPoint ) {

		if ( typeof value == 'number' ) {

			return road.getPosThetaAt( value );

		} else if ( value == TvContactPoint.START ) {

			return road.getPosThetaAt( 0 );

		} else if ( value == TvContactPoint.END ) {

			return road.getPosThetaAt( road.length );

		}

	}

	static findConnectionFromLink ( junction: TvJunction, link: TvJunctionLaneLink ) {

		for ( const connection of junction.getConnections() ) {

			for ( const laneLink of connection.laneLink ) {

				if ( laneLink == link ) {

					return connection;

				}

			}

		}

		return null;
	}
}
