/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "app/commands/base-command";
import { MapEvents } from "app/events/map-events";
import { ParkingEdge } from "app/map/parking/parking-edge";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { ParkingNode } from "app/map/parking/parking-node";
import { ParkingRegion } from "app/map/parking/parking-region";

export class DeleteParkingClusterCommand extends BaseCommand {

	private removed = {
		nodes: [] as ParkingNode[],
		edges: [] as ParkingEdge[],
		regions: [] as ParkingRegion[],
	};

	constructor ( private graph: ParkingGraph, private start: ParkingNode ) {

		super();

		const { nodes, edges, regions } = this.graph.collectConnectedSubgraph( this.start );

		this.removed.nodes = nodes.slice();

		this.removed.edges = edges.slice();

		this.removed.regions = regions.slice();

	}

	execute (): void {

		// Remove in stable order: regions -> edges -> nodes
		this.removed.regions.forEach( r => this.graph.detachAndRemoveRegion( r ) );

		this.removed.edges.forEach( e => this.graph.detachAndRemoveEdge( e ) );

		this.removed.nodes.forEach( n => this.graph.detachAndRemoveNode( n ) );

		this.graph.pruneDangling();

		this.removed.regions.forEach( r => MapEvents.removeMesh.emit( r ) );

		MapEvents.objectUpdated.emit( this.graph );


	}

	undo (): void {

		this.removed.nodes.forEach( n => this.graph.addNode( n ) );

		this.removed.edges.forEach( e => this.graph.addEdge( e ) );

		this.removed.regions.forEach( r => this.graph.addRegion( r ) );

		this.removed.regions.forEach( r => MapEvents.makeMesh.emit( r ) );

		MapEvents.objectUpdated.emit( this.graph );

	}

	redo (): void {

		this.execute();

	}

}
