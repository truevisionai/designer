/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseVisualizer } from "../../core/visualizers/base-visualizer";
import { ParkingCurve } from "../../map/parking/parking-curve";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { Object3D } from "three";
import { ParkingGraph } from "../../map/parking/parking-graph";
import { SplineDebugService } from "../../services/debug/spline-debug.service";
import { LineView } from "../../tools/lane/visualizers/line.view";
import { SharpArrowObject } from "../../objects/lane-arrow-object";
import { ParkingRegion } from "../../map/parking/parking-region";
import { Polygon } from "../../tools/lane/visualizers/polygon-view";
import { ParkingNodePoint } from "./objects/parking-node-point";
import { MapEvents } from "app/events/map-events";
import { ColorUtils } from "app/views/shared/utils/colors.service";
import { ParkingNode } from "app/map/parking/parking-node";
import { ParkingEdge } from "app/map/parking/parking-edge";

@Injectable()
export class ParkingCurveVisualizer extends BaseVisualizer<ParkingCurve> {

	private parkingCurveObjects: Object3DArrayMap<ParkingCurve, Object3D[]> = new Object3DArrayMap();

	private nodeObjects: Object3DArrayMap<ParkingNode, Object3D[]> = new Object3DArrayMap();

	private edgeObjects: Object3DArrayMap<ParkingEdge, Object3D[]> = new Object3DArrayMap();

	constructor (
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onHighlight ( object: ParkingCurve ): void {

		this.splineDebugService.showPolyline( object.getSpline() );

	}

	onSelected ( object: ParkingCurve ): void {

		this.splineDebugService.showPolyline( object.getSpline() );
		this.splineDebugService.showControlPoints( object.getSpline() );

	}

	onDefault ( object: ParkingCurve ): void {

		this.splineDebugService.removePolyline( object.getSpline() );

		this.showSpots( object );

	}

	onUnselected ( object: ParkingCurve ): void {

		this.splineDebugService.removeControlPoints( object.getSpline() );
		this.splineDebugService.removePolyline( object.getSpline() );

	}

	onAdded ( object: ParkingCurve ): void {

		this.showSpots( object );

	}

	onUpdated ( object: ParkingCurve ): void {

		this.splineDebugService.removePolyline( object.getSpline() );
		this.splineDebugService.removeControlPoints( object.getSpline() );

		this.splineDebugService.showPolyline( object.getSpline() );
		this.splineDebugService.showControlPoints( object.getSpline() );

		this.showSpots( object );

		console.log( 'Updated visualizer for parking curve' );

		MapEvents.makeMesh.emit( object );

	}

	onRemoved ( object: ParkingCurve ): void {

		super.removeFromHighlighted( object );

		this.parkingCurveObjects.removeKey( object );

		this.splineDebugService.removePolyline( object.getSpline() );
		this.splineDebugService.removeControlPoints( object.getSpline() );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( object => this.onRemoved( object ) );

	}

	clear (): void {

		this.highlighted.clear();

		this.splineDebugService.clear();

		this.parkingCurveObjects.clear();

		this.nodeObjects.clear();

		this.edgeObjects.clear();

	}

	showParkingGraph ( graph: ParkingGraph ): void {

		graph.getParkingCurves().forEach( parkingCurve => {

			this.onDefault( parkingCurve );

		} );

		this.updateParkingGraph( graph );

	}

	updateParkingGraph ( graph: ParkingGraph ): void {

		this.nodeObjects.clear();

		this.edgeObjects.clear();

		graph.getNodes().forEach( parkingNode => {

			this.nodeObjects.addItem( parkingNode, new ParkingNodePoint( parkingNode, parkingNode.position ) );

		} );

		graph.getEdges().forEach( parkingEdge => {

			this.edgeObjects.addItem( parkingEdge, LineView.create( parkingEdge.getNodePositions() ) );

		} );

	}

	updateByNode ( graph: ParkingGraph, node: ParkingNode ): void {

		const { nodes, edges, regions } = graph.collectIncidentDeletion( node );

		nodes.forEach( parkingNode => {

			this.nodeObjects.removeKey( parkingNode );

			this.nodeObjects.addItem( parkingNode, new ParkingNodePoint( parkingNode, parkingNode.position ) );

		} );

		edges.forEach( parkingEdge => {

			this.edgeObjects.removeKey( parkingEdge );

			this.edgeObjects.addItem( parkingEdge, LineView.create( parkingEdge.getNodePositions() ) );

		} );

		regions.forEach( region => {

			MapEvents.makeMesh.emit( region );

		});

	}

	private showSpots ( parkingCurve: ParkingCurve ): void {

		this.parkingCurveObjects.removeKey( parkingCurve );

		parkingCurve.generatePreviewRegions().forEach( region => {

			const arrowObject = new SharpArrowObject( region.getCenterPosition(), region.heading, ColorUtils.CYAN, 1.0 );
			const edgeObject = LineView.create( region.getPoints(), 1 );
			const regionObject = this.createRegionObject( region, parkingCurve );

			this.parkingCurveObjects.addItem( parkingCurve, arrowObject );
			this.parkingCurveObjects.addItem( parkingCurve, regionObject );
			this.parkingCurveObjects.addItem( parkingCurve, edgeObject );

		} );

	}

	private createRegionObject ( region: ParkingRegion, parkingCurve: ParkingCurve ): Object3D {

		const regionObject = Polygon.create( region.getPoints() );

		regionObject.material.transparent = true;
		regionObject.material.opacity = 0.001;
		regionObject.userData.parkingCurve = parkingCurve;
		regionObject[ 'tag' ] = ParkingCurve.tag;

		return regionObject;

	}

}
