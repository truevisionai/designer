/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { SplineService } from "../../services/spline/spline.service";
import { BaseToolService } from "../../tools/base-tool.service";
import { ToolWithHandler } from "../../tools/base-tool-v2";
import { ToolType } from "../../tools/tool-types.enum";
import {
	ParkingCurveCreator,
	ParkingCurvePointCreator
} from "./services/parking-spot-creation-strategy";
import { ParkingCurve } from "../../map/parking/parking-curve";
import { PointSelectionStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { MapService } from "app/services/map/map.service";
import { SimpleControlPointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";
import { ObjectUserDataStrategy } from "app/core/strategies/select-strategies/object-user-data-strategy";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { ParkingNode } from "app/map/parking/parking-node";
import { EmptyVisualizer } from "app/core/visualizers/empty-visualizer";
import { EmptyController } from "app/core/controllers/empty-controller";
import { ParkingCurveService } from "./parking-curve.service";
import { ParkingCurveController } from "./parking-curve-controller.service";
import { ParkingCurvePointController, ParkingNodeController, ParkingNodeVisualizer } from "./parking-curve-point-controller.service";
import { ParkingCurveVisualizer } from "./parking-curve-visualizer.service";
import { ParkingCurvePointVisualizer } from "./parking-curve-point-visualizer.service";
import { ParkingCurveInspector } from "./parking-curve.inspector";
import { ParkingNodePoint } from "./objects/parking-node-point";
import { ParkingCurvePoint } from "./objects/parking-curve-point";

@Injectable()
export class ParkingSpotToolService {

	constructor (
		public mapService: MapService,
		public parkingCurvService: ParkingCurveService,
		public splineService: SplineService,
		public base: BaseToolService,
		public parkingCurveCreator: ParkingCurveCreator,
		public parkingCurvePointCreator: ParkingCurvePointCreator,
		public parkignCurveVisualizer: ParkingCurveVisualizer,
	) {
	}
}

export class ParkingSpotTool extends ToolWithHandler {

	public name: string = 'ParkingSpotTool';

	public toolType = ToolType.ParkingSpot;

	constructor ( private tool: ParkingSpotToolService ) {

		super();

	}

	init (): void {

		super.init();

		this.addCreationStrategy( this.tool.parkingCurvePointCreator );
		this.addCreationStrategy( this.tool.parkingCurveCreator );

		this.addSelectionStrategy( ParkingCurvePoint, new PointSelectionStrategy( {
			tag: ParkingCurvePoint.TAG
		} ) );

		this.addSelectionStrategy( ParkingNodePoint, new PointSelectionStrategy( {
			tag: ParkingNodePoint.TAG,
		} ) );

		this.addSelectionStrategy( ParkingCurve, new ObjectUserDataStrategy<ParkingCurve>( ParkingCurve.tag, ParkingCurve.tag ) );

		this.addController( ParkingCurvePoint, this.tool.base.injector.get( ParkingCurvePointController ) );
		this.addVisualizer( ParkingCurvePoint, this.tool.base.injector.get( ParkingCurvePointVisualizer ) );

		this.addController( ParkingNodePoint, this.tool.base.injector.get( ParkingNodeController ) );
		this.addVisualizer( ParkingNodePoint, this.tool.base.injector.get( ParkingNodeVisualizer ) );

		this.addController( ParkingCurve, this.tool.base.injector.get( ParkingCurveController ) );
		this.addVisualizer( ParkingCurve, this.tool.base.injector.get( ParkingCurveVisualizer ) );

		this.addDragHandler( ParkingCurvePoint, this.tool.base.injector.get( SimpleControlPointDragHandler ) );
		this.addDragHandler( ParkingNodePoint, this.tool.base.injector.get( SimpleControlPointDragHandler ) );

		this.tool.parkignCurveVisualizer.showParkingGraph( this.tool.mapService.map.getParkingGraph() );

	}

	onObjectUpdated ( object: Object ): void {

		if ( object instanceof ParkingCurveInspector ) {

			super.onObjectUpdated( object.parkingCurve );

		} else if ( object instanceof ParkingGraph ) {

			this.tool.parkignCurveVisualizer.showParkingGraph( object );

		} else if ( object instanceof ParkingNode ) {

			// NOTE: hack to update parking graph

			const graph = this.tool.mapService.map.getParkingGraph()

			this.tool.parkignCurveVisualizer.updateParkingGraph( graph );

		} else {

			super.onObjectUpdated( object );

		}

	}

}
