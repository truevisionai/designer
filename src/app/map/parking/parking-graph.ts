import { Vector3 } from "three";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ParkingCurve } from "./parking-curve";
import { ParkingEdge } from "./parking-edge";
import { ParkingNode } from "./parking-node";
import { ParkingRegion } from "./parking-region";
import { readXmlArray } from "app/utils/xml-utils";

export class ParkingGraph {

	private parkingCurves: ParkingCurve[] = [];
	private nodes: ParkingNode[] = [];
	private edges: ParkingEdge[] = [];
	private regions: ParkingRegion[] = [];

	getParkingCurves (): readonly ParkingCurve[] {
		return this.parkingCurves;
	}

	getParkingCurveCount (): number {
		return this.parkingCurves.length;
	}

	addParkingCurve ( parkingCurve: ParkingCurve ): void {
		parkingCurve.setParkingGraph( this );
		this.parkingCurves.push( parkingCurve );
	}

	removeParkingCurve ( parkingCurve: ParkingCurve ): void {
		const index = this.parkingCurves.indexOf( parkingCurve );
		if ( index === -1 ) {
			throw new Error( `ParkingCurve with id ${ parkingCurve.id } not found` );
		} else {
			this.parkingCurves.splice( index, 1 );
		}
	}

	getNodes (): ParkingNode[] {
		return this.nodes;
	}

	getNodeCount (): number {
		return this.nodes.length;
	}

	getEdges (): ParkingEdge[] {
		return this.edges;
	}

	addEdge ( edge: ParkingEdge ): void {
		this.edges.push( edge );
	}

	removeEdge ( edge: ParkingEdge ): void {
		const index = this.edges.indexOf( edge );
		if ( index === -1 ) {
			throw new Error( `Edge with id ${ edge.id } not found` );
		} else {
			this.edges.splice( index, 1 );
		}
	}

	addNode ( node: ParkingNode ): void {
		this.nodes.push( node );
	}

	removeNode ( node: ParkingNode ): void {
		const index = this.nodes.indexOf( node );
		if ( index === -1 ) {
			throw new Error( `Node with id ${ node.id } not found` );
		} else {
			this.nodes.splice( index, 1 );
		}
	}

	addRegion ( region: ParkingRegion ): void {
		this.regions.push( region );
	}

	addRegions ( regions: ParkingRegion[] ): void {
		regions.forEach( region => this.addRegion( region ) );
	}

	removeRegion ( region: ParkingRegion ): void {
		const index = this.regions.indexOf( region );
		if ( index === -1 ) {
			throw new Error( `Region with id ${ region.id } not found` );
		} else {
			this.regions.splice( index, 1 );
		}
	}

	removeRegions ( regions: ParkingRegion[] ): void {
		regions.forEach( region => this.removeRegion( region ) );
	}

	getEdgeCount (): number {
		return this.edges.length;
	}

	getRegions (): ParkingRegion[] {
		return this.regions;
	}

	getRegionCount (): number {
		return this.regions.length;
	}

	createParkingCurve ( positions: Vector3[] ): ParkingCurve {

		const curve = new ParkingCurve();

		const points = positions.map( point => new SimpleControlPoint( curve, point ) );

		curve.setControlPoints( points );

		this.parkingCurves.push( curve );

		return curve;

	}

	/**
	 * Bake the given curve into one or more ParkingRegion(s).
	 * This method will:
	 *   1) Generate the polygons (preview) from the curve
	 *   2) Convert those polygons into shared edges/nodes
	 *   3) Create ParkingRegion(s) referencing those edges
	 */
	public bakeCurve ( curve: ParkingCurve ): ParkingRegion[] {
		const newRegions = curve.bake( this );
		// Remove the curve from the unbaked list
		this.parkingCurves = this.parkingCurves.filter( c => c !== curve );
		// Add the newly created regions to the graph
		// this.regions.push( ...newRegions );
		return newRegions;
	}

	/**
	 * Find or create a node at a given (x,y,z).
	 * You can implement tolerance logic if you want to reuse
	 * existing nodes that are "close enough" to reduce duplicates.
	 */
	public getOrCreateNode ( position: Vector3 ): ParkingNode {
		// For simplicity, let's skip tolerance and do exact matches
		const existing = this.nodes.find( node => node.position.distanceTo( position ) < 0.01 );
		if ( existing ) return existing;

		// Otherwise create a new node
		const newNode = new ParkingNode( position );
		this.nodes.push( newNode );
		return newNode;
	}

	/**
	 * Find or create an edge connecting two nodes.
	 * Could do something similar to avoid duplicates.
	 */
	public getOrCreateEdge ( start: ParkingNode, end: ParkingNode ): ParkingEdge {
		// Ensure consistent ordering if needed
		// Could search for an existing edge with the same node references
		const existing = this.edges.find( e => e.matches( start, end ) || e.matches( end, start ) );
		if ( existing ) return existing;

		// Otherwise create new
		const newEdge = new ParkingEdge( start, end );
		this.edges.push( newEdge );
		return newEdge;
	}

	public createRegion ( edges: ParkingEdge[] ): ParkingRegion {
		const region = new ParkingRegion( 0 );
		region.setEdges( edges );
		// Let the region know about the edges
		this.regions.push( region );
		return region;
	}

	static fromSceneJSON ( json: any ): ParkingGraph {

		const graph = new ParkingGraph();

		readXmlArray( json.node, ( node: any ) => {
			graph.addNode( ParkingNode.fromSceneJSON( node ) );
		} );

		readXmlArray( json.edge, ( json: any ) => {

			const startNode = graph.getNodesById( json.attr_startNodeId );
			const endNode = graph.getNodesById( json.attr_endNodeId );
			const markingGuid = json.attr_markingGuid;
			const id = json.attr_id;

			const edge = new ParkingEdge( startNode, endNode, markingGuid );

			edge.id = id;

			graph.addEdge( edge );

		} );

		readXmlArray( json.region, ( json: any ) => {

			const heading = parseFloat( json.attr_heading );

			const region = new ParkingRegion( heading );

			region.id = json.attr_id;

			readXmlArray( json.edge, ( json: any ) => {
				region.addEdge( graph.getEdgeById( json.attr_id ) );
			} );

			graph.addRegion( region );

		} );

		readXmlArray( json.parkingCurve, ( curve: any ) => {
			graph.addParkingCurve( ParkingCurve.fromSceneJSON( curve ) );
		} );

		return graph;

	}

	getEdgeById ( edgeId: string ): ParkingEdge {
		const edge = this.edges.find( edge => edge.id === edgeId );
		if ( !edge ) {
			throw new Error( `Edge with id ${ edgeId } not found` );
		}
		return edge;
	}

	getNodesById ( nodeId: string ): ParkingNode {
		const node = this.nodes.find( node => node.id === nodeId );
		if ( !node ) {
			throw new Error( `Node with id ${ nodeId } not found` );
		}
		return node;
	}

	toSceneJSON (): any {
		return {
			node: this.nodes.map( node => node.toSceneJSON() ),
			edge: this.edges.map( edge => edge.toSceneJSON() ),
			region: this.regions.map( region => region.toSceneJSON() ),
			parkingCurve: this.parkingCurves.map( curve => curve.toSceneJSON() )
		}
	}
}
