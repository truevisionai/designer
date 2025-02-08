import { ParkingEdge } from "./parking-edge";
import { MathUtils } from "three/src/math/MathUtils";
import { Vector3 } from "three";
import { ParkingNode } from "./parking-node";

export class ParkingRegion {

	private edges: ParkingEdge[] = [];

	public readonly id: string;

	constructor (
		id?: string,
		public readonly heading?: number
	) {
		this.id = id ?? MathUtils.generateUUID();
	}

	getEdgeCount (): number {
		return this.edges.length;
	}

	getEdges (): ParkingEdge[] {
		return this.edges;
	}

	addEdge ( edge: ParkingEdge ): void {
		this.edges.push( edge );
	}

	removeEdge ( edge: ParkingEdge ): void {
		this.edges.splice( this.edges.indexOf( edge ), 1 );
	}

	setEdges ( edges: ParkingEdge[] ): void {
		this.edges = edges;
	}

	getPoints (): Vector3[] {
		// return this.edges.map( edge => [ edge.startNode.position, edge.endNode.position ] );
		return this.edges.flatMap( edge => [ edge.startNode.position, edge.endNode.position ] );
	}

	getCenter (): Vector3 {
		if ( this.edges.length === 0 ) return new Vector3();
		const sum = this.edges.reduce( ( acc, edge ) => acc.add( edge.startNode.position ), new Vector3() );
		return sum.divideScalar( this.edges.length );
	}

	/**
	 * If you want the region's nodes in order,
	 * you can derive them from edges. For a simple polygon,
	 * each edge's end node matches the next edge's start node.
	 */
	public getNodesInOrder (): ParkingNode[] {

		if ( this.edges.length === 0 ) return [];

		const orderedNodes: ParkingNode[] = [];

		// naive approach: start with the first edge's start node
		let currentEdge = this.edges[ 0 ];

		orderedNodes.push( currentEdge.startNode );

		// Then proceed, matching end node to the next edge's start node
		for ( let i = 0; i < this.edges.length; i++ ) {

			orderedNodes.push( currentEdge.endNode );

			// find the next edge whose startNode is the last endNode
			const nextEdge = this.edges.find( e => e.startNode === currentEdge.endNode );

			if ( !nextEdge ) break; // or handle if region is closed

			currentEdge = nextEdge;

		}

		return orderedNodes;
	}

}
