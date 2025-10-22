/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "app/commands/base-command";
import { ParkingEdge } from "app/map/parking/parking-edge";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { ParkingNode } from "app/map/parking/parking-node";
import { ParkingRegion } from "app/map/parking/parking-region";

export class DeleteParkingNodeCommand extends BaseCommand {

	private removed = {
		nodes: [] as ParkingNode[],
		edges: [] as ParkingEdge[],
		regions: [] as ParkingRegion[],
	};

	constructor ( private graph: ParkingGraph, private parkingNode: ParkingNode ) {

		super();

		const { nodes, edges, regions } = this.graph.collectIncidentDeletion( this.parkingNode );

		this.removed.nodes = nodes.slice();

		this.removed.edges = edges.slice();

		this.removed.regions = regions.slice();

	}

	execute (): void {

		this.removed.regions.forEach( r => this.graph.detachAndRemoveRegion( r ) );

		this.removed.edges.forEach( e => this.graph.detachAndRemoveEdge( e ) );

		this.removed.nodes.forEach( n => this.graph.detachAndRemoveNode( n ) );

		this.graph.pruneDangling();

	}

	undo (): void {

		this.removed.nodes.forEach( n => this.graph.addNode( n ) );

		this.removed.edges.forEach( e => this.graph.addEdge( e ) );

		this.removed.regions.forEach( r => this.graph.addRegion( r ) );

	}

	redo (): void {

		this.execute();

	}

}
