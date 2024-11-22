/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "./junctions/tv-junction";
import { TvContactPoint } from "./tv-common";
import { TvLaneSection } from "./tv-lane-section";
import { TvLinkType } from "./tv-link";
import { TvRoad } from "./tv-road.model";

/**
 * Experimental class to generate a routing graph from an OpenDRIVE map.
 */

class LaneKey {
	constructor (
		public roadId: number,
		public lanesectionS0: number,
		public laneId: number
	) {
	}

	equals ( other: LaneKey ): boolean {
		return (
			this.roadId === other.roadId &&
			this.lanesectionS0 === other.lanesectionS0 &&
			this.laneId === other.laneId
		);
	}

	hashCode (): string {
		return `${ this.roadId }-${ this.lanesectionS0 }-${ this.laneId }`;
	}
}

class WeightedLaneKey extends LaneKey {
	constructor (
		roadId: number,
		lanesectionS0: number,
		laneId: number,
		public weight: number
	) {
		super( roadId, lanesectionS0, laneId );
	}

	static fromLaneKey ( laneKey: LaneKey, weight: number ): WeightedLaneKey {
		return new WeightedLaneKey( laneKey.roadId, laneKey.lanesectionS0, laneKey.laneId, weight );
	}
}

class RoutingGraphEdge {
	constructor (
		public from: LaneKey,
		public to: LaneKey,
		public weight: number
	) {
	}
}

class RoutingGraph {
	private edges: Set<RoutingGraphEdge> = new Set();
	private laneKeyToSuccessors: Map<string, Set<WeightedLaneKey>> = new Map();
	private laneKeyToPredecessors: Map<string, Set<WeightedLaneKey>> = new Map();

	addEdge ( edge: RoutingGraphEdge ): void {
		this.edges.add( edge );

		const fromHash = edge.from.hashCode();
		if ( !this.laneKeyToSuccessors.has( fromHash ) ) {
			this.laneKeyToSuccessors.set( fromHash, new Set() );
		}
		this.laneKeyToSuccessors.get( fromHash )!.add( WeightedLaneKey.fromLaneKey( edge.to, edge.weight ) );

		const toHash = edge.to.hashCode();
		if ( !this.laneKeyToPredecessors.has( toHash ) ) {
			this.laneKeyToPredecessors.set( toHash, new Set() );
		}
		this.laneKeyToPredecessors.get( toHash )!.add( WeightedLaneKey.fromLaneKey( edge.from, edge.weight ) );
	}

	getLaneSuccessors ( laneKey: LaneKey ): LaneKey[] {
		const successors = this.laneKeyToSuccessors.get( laneKey.hashCode() ) || new Set();
		return Array.from( successors );
	}

	getLanePredecessors ( laneKey: LaneKey ): LaneKey[] {
		const predecessors = this.laneKeyToPredecessors.get( laneKey.hashCode() ) || new Set();
		return Array.from( predecessors );
	}

	shortestPath ( from: LaneKey, to: LaneKey ): LaneKey[] {
		if ( !this.laneKeyToSuccessors.has( from.hashCode() ) ) {
			return [];
		}

		const vertices = new Set<string>();
		for ( const [ key, successors ] of this.laneKeyToSuccessors.entries() ) {
			vertices.add( key );
			for ( const successor of successors ) {
				vertices.add( successor.hashCode() );
			}
		}

		if ( !vertices.has( to.hashCode() ) ) {
			return [];
		}

		const weights = new Map<string, number>();
		const previous = new Map<string, LaneKey>();
		const nodes: LaneKey[] = [];

		for ( const vertexHash of vertices ) {
			const weight = vertexHash === from.hashCode() ? 0 : Infinity;
			weights.set( vertexHash, weight );
			nodes.push( this.hashToLaneKey( vertexHash ) );
		}

		while ( nodes.length > 0 ) {
			nodes.sort( ( a, b ) => ( weights.get( b.hashCode() ) || 0 ) - ( weights.get( a.hashCode() ) || 0 ) );
			const smallest = nodes.pop()!;

			if ( smallest.equals( to ) ) {
				const path: LaneKey[] = [];
				let current: LaneKey | undefined = smallest;
				while ( current ) {
					path.unshift( current );
					current = previous.get( current.hashCode() );
				}
				return path;
			}

			if ( weights.get( smallest.hashCode() ) === Infinity ) {
				break;
			}

			const successors = this.laneKeyToSuccessors.get( smallest.hashCode() );
			if ( !successors ) continue;

			for ( const successor of successors ) {
				const alt = ( weights.get( smallest.hashCode() ) || 0 ) + successor.weight;
				if ( alt < ( weights.get( successor.hashCode() ) || Infinity ) ) {
					weights.set( successor.hashCode(), alt );
					previous.set( successor.hashCode(), smallest );
				}
			}
		}

		return [];
	}

	private hashToLaneKey ( hash: string ): LaneKey {
		const [ roadId, lanesectionS0, laneId ] = hash.split( '-' );
		return new LaneKey( parseInt( roadId ), parseFloat( lanesectionS0 ), parseInt( laneId ) );
	}
}

class OpenDriveMap {
	private roadMap: Map<number, TvRoad> = new Map();
	private junctionMap: Map<number, TvJunction> = new Map();

	constructor ( roads: TvRoad[], junctions: TvJunction[] ) {
		for ( const road of roads ) {
			this.roadMap.set( road.id, road );
		}

		for ( const junction of junctions ) {
			this.junctionMap.set( junction.id, junction );
		}
	}

	getRoutingGraph (): RoutingGraph {
		const routingGraph = new RoutingGraph();

		// Find lane successors and predecessors
		for ( const isSuccessor of [ true, false ] ) {

			for ( const [ roadId, road ] of this.roadMap ) {

				const roadLink = isSuccessor ? road.successor : road.predecessor;

				if ( roadLink?.type !== TvLinkType.ROAD || roadLink.contactPoint === null ) {
					continue;
				}

				const nextRoad = this.roadMap.get( roadLink.element.id );
				if ( !nextRoad ) continue;

				const nextRoadContactLaneSection = ( roadLink.contactPoint === TvContactPoint.START )
					? nextRoad.laneSections[ 0 ]
					: nextRoad.laneSections[ nextRoad.laneSections.length - 1 ];

				for ( let i = 0; i < road.laneSections.length; i++ ) {
					const currentLaneSection = road.laneSections[ i ];
					let nextLaneSection: TvLaneSection | null = null;
					let nextLaneSectionRoad: TvRoad | null = null;

					// Determine the next lane section based on whether we're finding successors or predecessors
					if ( isSuccessor && i === road.laneSections.length - 1 ) {
						nextLaneSection = nextRoadContactLaneSection;
						nextLaneSectionRoad = nextRoad;
					} else if ( !isSuccessor && i === 0 ) {
						nextLaneSection = nextRoadContactLaneSection;
						nextLaneSectionRoad = nextRoad;
					} else {
						nextLaneSection = isSuccessor ? road.laneSections[ i + 1 ] : road.laneSections[ i - 1 ];
						nextLaneSectionRoad = road;
					}

					for ( const lane of currentLaneSection.getLanes() ) {
						const nextLaneId = isSuccessor ? lane.successorId : lane.predecessorId;
						if ( nextLaneId === 0 ) continue;

						const nextLane = nextLaneSection.getLaneById( nextLaneId );
						if ( !nextLane ) continue;

						const fromLane = isSuccessor ? lane : nextLane;
						const fromLaneSection = isSuccessor ? currentLaneSection : nextLaneSection;
						const fromRoad = isSuccessor ? road : nextLaneSectionRoad;

						const toLane = isSuccessor ? nextLane : lane;
						const toLaneSection = isSuccessor ? nextLaneSection : currentLaneSection;
						const toRoad = isSuccessor ? nextLaneSectionRoad : road;

						const from = new LaneKey( fromRoad.id, fromLaneSection.s, fromLane.id );
						const to = new LaneKey( toRoad.id, toLaneSection.s, toLane.id );
						const laneLength = fromLaneSection.getLength();
						routingGraph.addEdge( new RoutingGraphEdge( from, to, laneLength ) );
					}
				}
			}
		}

		// Parse junctions
		for ( const [ junctionId, junction ] of this.junctionMap ) {
			for ( const connection of junction.getConnections() ) {
				const incomingRoad = this.roadMap.get( connection.incomingRoad.id );
				const connectingRoad = this.roadMap.get( connection.connectingRoad.id );
				if ( !incomingRoad || !connectingRoad ) continue;

				const isSuccessorJunction = incomingRoad.successor?.type === TvLinkType.JUNCTION && incomingRoad.successor.id === junctionId;
				const isPredecessorJunction = incomingRoad.predecessor?.type === TvLinkType.JUNCTION && incomingRoad.predecessor.id === junctionId;
				if ( !isSuccessorJunction && !isPredecessorJunction ) continue;

				const incomingLaneSection = isSuccessorJunction
					? incomingRoad.laneSections[ incomingRoad.laneSections.length - 1 ]
					: incomingRoad.laneSections[ 0 ];
				const connectingLaneSection = ( connection.contactPoint === TvContactPoint.START )
					? connectingRoad.laneSections[ 0 ]
					: connectingRoad.laneSections[ connectingRoad.laneSections.length - 1 ];

				for ( const laneLink of connection.laneLinks ) {
					if ( laneLink.from === 0 || laneLink.to === 0 ) continue;

					const fromLane = incomingLaneSection.getLaneById( laneLink.from );
					const toLane = connectingLaneSection.getLaneById( laneLink.to );
					if ( !fromLane || !toLane ) continue;

					const from = new LaneKey( incomingRoad.id, incomingLaneSection.s, fromLane.id );
					const to = new LaneKey( connectingRoad.id, connectingLaneSection.s, toLane.id );
					const laneLength = incomingLaneSection.getLength();
					routingGraph.addEdge( new RoutingGraphEdge( from, to, laneLength ) );
				}
			}
		}

		return routingGraph;
	}
}
