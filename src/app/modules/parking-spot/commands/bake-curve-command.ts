import { BaseCommand } from "app/commands/base-command";
import { MapEvents } from "app/events/map-events";
import { ParkingCurve } from "app/map/parking/parking-curve";
import { ParkingEdge } from "app/map/parking/parking-edge";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { ParkingNode } from "app/map/parking/parking-node";
import { ParkingRegion } from "app/map/parking/parking-region";

export class BakeCurveCommand extends BaseCommand {

	private regions: ParkingRegion[];

	private edges = new Set<ParkingEdge>();

	private nodes = new Set<ParkingNode>();

	constructor ( private graph: ParkingGraph, private parkingCurve: ParkingCurve ) {

		super();

		this.regions = parkingCurve.bake( graph );

		this.regions.forEach( region => {

			region.getEdges().forEach( edge => this.edges.add( edge ) );

			region.getNodes().forEach( node => this.nodes.add( node ) );

		} );

	}

	execute (): void {

		// this.graph.removeParkingCurve( this.parkingCurve );

		MapEvents.objectRemoved.emit( this.parkingCurve );

		MapEvents.objectUpdated.emit( this.graph );

	}

	undo (): void {

		// this.graph.addParkingCurve( this.parkingCurve );

		this.graph.removeRegions( this.regions );

		this.nodes.forEach( node => this.graph.removeNode( node ) );

		this.edges.forEach( edge => this.graph.removeEdge( edge ) );

		MapEvents.objectAdded.emit( this.parkingCurve );

		MapEvents.objectUpdated.emit( this.graph );

	}

	redo (): void {

		// this.graph.removeParkingCurve( this.parkingCurve );

		this.graph.addRegions( this.regions );

		this.nodes.forEach( node => this.graph.addNode( node ) );

		this.edges.forEach( edge => this.graph.addEdge( edge ) );

		MapEvents.objectRemoved.emit( this.parkingCurve );

		MapEvents.objectUpdated.emit( this.graph );

	}

}
