/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ParkingCurve } from "./parking-curve";
import { ParkingEdge } from "./parking-edge";
import { ParkingNode } from "./parking-node";
import { ParkingRegion } from "./parking-region";
import { readXmlArray } from "app/utils/xml-utils";

export class ParkingGraph {

	private parkingCurves: ParkingCurve[] = [];
	private nodes = new Map<string, ParkingNode>();
	private edges = new Map<string, ParkingEdge>();
	private regions = new Map<string, ParkingRegion>();

	// Incidence
	private edgesByNode = new Map<string, Set<string>>();
	private regionsByEdge = new Map<string, Set<string>>();

	// Directional adjacency
	private outAdj = new Map<string, Set<string>>();
	private inAdj = new Map<string, Set<string>>();

	getParkingCurves (): readonly ParkingCurve[] {
		return this.parkingCurves;
	}

	getParkingCurveCount (): number {
		return this.parkingCurves.length;
	}

	getParkingRegions (): readonly ParkingRegion[] {
		return Array.from( this.regions.values() ) as readonly ParkingRegion[];
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
		return Array.from( this.nodes.values() );
	}

	getNodeCount (): number {
		return this.nodes.size;
	}

	getEdges (): ParkingEdge[] {
		return Array.from( this.edges.values() );
	}

	addEdge ( edge: ParkingEdge ): void {
		if ( this.edges.has( edge.id ) ) {
			return;
		}

		this.edges.set( edge.id, edge );
		this.registerEdge( edge );
	}

	removeEdge ( edge: ParkingEdge ): void {
		if ( !this.edges.has( edge.id ) ) {
			throw new Error( `Edge with id ${ edge.id } not found` );
		} else {
			this.edges.delete( edge.id );
			this.unregisterEdge( edge );
		}
	}

	addNode ( node: ParkingNode ): void {
		if ( this.nodes.has( node.id ) ) {
			return;
		}

		this.nodes.set( node.id, node );
		this.registerNode( node );
	}

	removeNode ( node: ParkingNode ): void {
		if ( !this.nodes.has( node.id ) ) {
			throw new Error( `Node with id ${ node.id } not found` );
		} else {
			this.nodes.delete( node.id );
			this.unregisterNode( node );
		}
	}

	addRegion ( region: ParkingRegion ): void {
		this.regions.set( region.id, region );
		this.registerRegion( region );
	}

	addRegions ( regions: ParkingRegion[] ): void {
		regions.forEach( region => this.addRegion( region ) );
	}

	removeRegion ( region: ParkingRegion ): void {
		if ( !this.regions.has( region.id ) ) {
			throw new Error( `Region with id ${ region.id } not found` );
		} else {
			this.regions.delete( region.id );
			this.unregisterRegion( region );
		}
	}

	removeRegions ( regions: ParkingRegion[] ): void {
		regions.forEach( region => this.removeRegion( region ) );
	}

	getEdgeCount (): number {
		return this.edges.size;
	}

	getRegions (): ParkingRegion[] {
		return Array.from( this.regions.values() );
	}

	getRegionCount (): number {
		return this.regions.size;
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
		return newRegions;
	}

	/**
	 * Find or create a node at a given (x,y,z).
	 * You can implement tolerance logic if you want to reuse
	 * existing nodes that are "close enough" to reduce duplicates.
	 */
	public getOrCreateNode ( position: Vector3 ): ParkingNode {
		// For simplicity, let's skip tolerance and do exact matches
		for ( const node of this.nodes.values() ) {
			if ( node.position.distanceTo( position ) < 0.01 ) {
				return node;
			}
		}

		// Otherwise create a new node
		const newNode = new ParkingNode( position );
		this.addNode( newNode );
		return newNode;
	}

	/**
	 * Find or create an edge connecting two nodes.
	 * Could do something similar to avoid duplicates.
	 */
	public getOrCreateEdge ( start: ParkingNode, end: ParkingNode ): ParkingEdge {
		this.ensureNodeEntry( start.id );
		this.ensureNodeEntry( end.id );

			const startIncidents = this.edgesByNode.get( start.id );
			if ( startIncidents ) {
				for ( const edgeId of startIncidents ) {
					const candidate = this.edges.get( edgeId );
					if ( !candidate ) continue;

					const forward = candidate.matches( start, end );
					const reverse = candidate.matches( end, start );

				if ( forward || reverse ) {
					return candidate;
				}
			}
		}

		const newEdge = new ParkingEdge( start, end );
		this.addEdge( newEdge );
		return newEdge;
	}

	public createRegion ( edges: ParkingEdge[] ): ParkingRegion {
		const region = new ParkingRegion( 0 );
		region.setEdges( edges );
		this.addRegion( region );
		return region;
	}

	private registerNode ( node: ParkingNode ): void {
		this.ensureNodeEntry( node.id );
	}

	private unregisterNode ( node: ParkingNode ): void {
		this.edgesByNode.delete( node.id );
		this.outAdj.delete( node.id );
		this.inAdj.delete( node.id );
	}

	private registerEdge ( edge: ParkingEdge ): void {
		const startId = edge.getStartNode().id;
		const endId = edge.getEndNode().id;

		if ( !this.nodes.has( startId ) ) {
			this.addNode( edge.getStartNode() );
		}

		if ( !this.nodes.has( endId ) ) {
			this.addNode( edge.getEndNode() );
		}

		this.ensureNodeEntry( startId );
		this.ensureNodeEntry( endId );

		this.edgesByNode.get( startId )!.add( edge.id );
		this.edgesByNode.get( endId )!.add( edge.id );

		this.outAdj.get( startId )!.add( edge.id );
		this.inAdj.get( endId )!.add( edge.id );
	}

	private unregisterEdge ( edge: ParkingEdge ): void {
		const startId = edge.getStartNode().id;
		const endId = edge.getEndNode().id;

		this.edgesByNode.get( startId )?.delete( edge.id );
		this.edgesByNode.get( endId )?.delete( edge.id );

		this.outAdj.get( startId )?.delete( edge.id );
		this.inAdj.get( endId )?.delete( edge.id );

		const regionIds = this.regionsByEdge.get( edge.id );
		if ( regionIds ) {
			regionIds.forEach( regionId => {
				const region = this.regions.get( regionId );
				region?.removeEdge( edge );
			} );
			this.regionsByEdge.delete( edge.id );
		}
	}

	private registerRegion ( region: ParkingRegion ): void {
		this.unlinkAllRegionEdgeRefs( region.id );

		for ( const edge of region.getEdges() ) {
			this.linkRegionEdge( region, edge );
		}
	}

	private unregisterRegion ( region: ParkingRegion ): void {
		this.unlinkAllRegionEdgeRefs( region.id );
	}

	private linkRegionEdge ( region: ParkingRegion, edge: ParkingEdge ): void {
		if ( !this.edges.has( edge.id ) ) {
			this.addEdge( edge );
		}

		let holders = this.regionsByEdge.get( edge.id );

		if ( !holders ) {
			holders = new Set<string>();
			this.regionsByEdge.set( edge.id, holders );
		}

		holders.add( region.id );
	}

	private unlinkAllRegionEdgeRefs ( regionId: string ): void {
		for ( const [ edgeId, holders ] of Array.from( this.regionsByEdge.entries() ) ) {
			if ( holders.delete( regionId ) && holders.size === 0 ) {
				this.regionsByEdge.delete( edgeId );
			}
		}
	}

	private ensureNodeEntry ( nodeId: string ): void {
		if ( !this.edgesByNode.has( nodeId ) ) {
			this.edgesByNode.set( nodeId, new Set<string>() );
		}

		if ( !this.outAdj.has( nodeId ) ) {
			this.outAdj.set( nodeId, new Set<string>() );
		}

		if ( !this.inAdj.has( nodeId ) ) {
			this.inAdj.set( nodeId, new Set<string>() );
		}
	}

	static fromSceneJSON ( json: any ): ParkingGraph {

		const graph = new ParkingGraph();

		readXmlArray( json.node, ( node: any ) => {
			graph.addNode( ParkingNode.fromSceneJSON( node ) );
		} );

		readXmlArray( json.edge, ( json: any ) => {

			const edge = ParkingEdge.fromSceneJSON( json, graph );

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
		const edge = this.edges.get( edgeId );
		if ( !edge ) {
			throw new Error( `Edge with id ${ edgeId } not found` );
		}
		return edge;
	}

	getNodesById ( nodeId: string ): ParkingNode {
		const node = this.nodes.get( nodeId );
		if ( !node ) {
			throw new Error( `Node with id ${ nodeId } not found` );
		}
		return node;
	}

	getEdgesForNode ( node: ParkingNode ): ParkingEdge[] {
		const incident = this.edgesByNode.get( node.id );
		if ( !incident?.size ) return [];

		const result: ParkingEdge[] = [];
		for ( const edgeId of incident ) {
			const edge = this.edges.get( edgeId );
			if ( edge ) result.push( edge );
		}
		return result;
	}

	getRegionsForEdge ( edge: ParkingEdge ): ParkingRegion[] {
		const holders = this.regionsByEdge.get( edge.id );

		if ( !holders?.size ) return [];

		const result: ParkingRegion[] = [];
		for ( const regionId of holders ) {
			const region = this.regions.get( regionId );
			if ( region ) result.push( region );
		}
		return result;
	}

	getRegionsForNode ( node: ParkingNode ): ParkingRegion[] {
		const incident = this.getEdgesForNode( node );
		const set = new Set<ParkingRegion>();
		incident.forEach( e => this.getRegionsForEdge( e ).forEach( r => set.add( r ) ) );
		return [ ...set ];
	}

	getNeighborNodes ( node: ParkingNode ): ParkingNode[] {
		const n = new Set<ParkingNode>();
		const incidentEdges = this.edgesByNode.get( node.id );

		if ( incidentEdges ) {
			for ( const edgeId of incidentEdges ) {
				const edge = this.edges.get( edgeId );
				if ( !edge ) continue;

				if ( edge.getStartNode().id !== node.id ) n.add( edge.getStartNode() );
				if ( edge.getEndNode().id !== node.id ) n.add( edge.getEndNode() );
			}
		}

		return [ ...n ];
	}

	/** Remove a region and detach its internal references safely. */
	detachAndRemoveRegion ( region: ParkingRegion ): void {
		// If your ParkingRegion stores references both ways, ensure it drops them.
		// Assuming region.getEdges() returns the current edges list:
		// If regions don't need explicit edge detach, you can skip the loop.
		// region.clearEdges(); // if you have it
		this.removeRegion( region );
	}

	/** Remove an edge and detach from nodes/regions. */
	detachAndRemoveEdge ( edge: ParkingEdge ): void {
		// If edge maintains backrefs, clear them here
		this.removeEdge( edge );
	}

	/** Remove a node; caller guarantees no edges still reference it. */
	detachAndRemoveNode ( node: ParkingNode ): void {
		this.removeNode( node );
	}

	/** Prune edges that no region references; then prune nodes with no edges. */
	pruneDangling (): void {
		// prune edges
		const usedEdge = new Set<string>();
		for ( const region of this.regions.values() ) {
			for ( const edge of region.getEdges() ) usedEdge.add( edge.id );
		}
		for ( const edge of Array.from( this.edges.values() ) ) {
			if ( !usedEdge.has( edge.id ) ) this.detachAndRemoveEdge( edge );
		}

		// prune nodes
		const degree = new Map<string, number>();
		for ( const edge of this.edges.values() ) {
			degree.set( edge.getStartNode().id, ( degree.get( edge.getStartNode().id ) ?? 0 ) + 1 );
			degree.set( edge.getEndNode().id, ( degree.get( edge.getEndNode().id ) ?? 0 ) + 1 );
		}
		for ( const node of Array.from( this.nodes.values() ) ) {
			if ( ( degree.get( node.id ) ?? 0 ) === 0 ) this.detachAndRemoveNode( node );
		}
	}

	/** Collect the *incident* deletion set for a single node. */
	collectIncidentDeletion ( node: ParkingNode ): { nodes: ParkingNode[], edges: ParkingEdge[], regions: ParkingRegion[] } {
		const edges = this.getEdgesForNode( node );
		const regionsSet = new Set<ParkingRegion>();
		edges.forEach( e => this.getRegionsForEdge( e ).forEach( r => regionsSet.add( r ) ) );
		return {
			nodes: [ node ],
			edges,
			regions: [ ...regionsSet ],
		};
	}

	/** Collect the *connected component* from a start node (undirected BFS). */
	collectConnectedSubgraph ( start: ParkingNode ): { nodes: ParkingNode[], edges: ParkingEdge[], regions: ParkingRegion[] } {
		const visitNode = new Set<ParkingNode>();
		const visitEdge = new Set<ParkingEdge>();

		const q: ParkingNode[] = [ start ];
		visitNode.add( start );

		while ( q.length ) {
			const n = q.shift()!;
			const edges = this.getEdgesForNode( n );
			edges.forEach( e => {
				if ( !visitEdge.has( e ) ) {
					visitEdge.add( e );
					const other = e.getStartNode().matches( n ) ? e.getEndNode() : e.getStartNode();
					if ( !visitNode.has( other ) ) {
						visitNode.add( other );
						q.push( other );
					}
				}
			} );
		}

		const regionsSet = new Set<ParkingRegion>();
		[ ...visitEdge ].forEach( e => this.getRegionsForEdge( e ).forEach( r => regionsSet.add( r ) ) );

		return {
			nodes: [ ...visitNode ],
			edges: [ ...visitEdge ],
			regions: [ ...regionsSet ],
		};
	}


	toSceneJSON (): any {
		return {
			node: this.getNodes().map( node => node.toSceneJSON() ),
			edge: this.getEdges().map( edge => edge.toSceneJSON() ),
			region: this.getRegions().map( region => region.toSceneJSON() ),
			parkingCurve: this.parkingCurves.map( curve => curve.toSceneJSON() )
		}
	}
}
