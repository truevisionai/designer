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

@Injectable()
export class ParkingCurveVisualizer extends BaseVisualizer<ParkingCurve> {

	private parkingCurveObjects: Object3DArrayMap<ParkingCurve, Object3D[]> = new Object3DArrayMap();

	private graphObjects: Object3DArrayMap<ParkingGraph, Object3D[]> = new Object3DArrayMap();

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

		this.graphObjects.clear();

	}

	showParkingGraph ( graph: ParkingGraph ): void {

		graph.getParkingCurves().forEach( parkingCurve => {

			this.onDefault( parkingCurve );

		} );

		this.updateParkingGraph( graph );

	}

	updateParkingGraph ( graph: ParkingGraph ): void {

		this.graphObjects.clear();

		graph.getNodes().forEach( parkinNode => {

			this.graphObjects.addItem( graph, new ParkingNodePoint( parkinNode, parkinNode.position ) )

		} );

		graph.getEdges().forEach( parkingEdge => {

			this.graphObjects.addItem( graph, LineView.create( parkingEdge.getNodePositions() ) );

		} );

	}

	private showSpots ( parkingCurve: ParkingCurve ): void {

		this.parkingCurveObjects.removeKey( parkingCurve );

		parkingCurve.generatePreviewRegions().forEach( region => {

			const arrowObject = new SharpArrowObject( region.getCenterPosition(), region.heading );
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
