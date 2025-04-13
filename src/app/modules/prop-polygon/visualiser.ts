import { Injectable } from "@angular/core";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { PropPolygon } from "app/map/prop-polygon/prop-polygon.model";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { PropPolygonPoint } from "./objects/prop-polygon-point";
import { ColorUtils } from "app/views/shared/utils/colors.service";


@Injectable()
export class PropPolygonVisualizer extends BaseVisualizer<PropPolygon> {

	constructor (
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onHighlight ( object: PropPolygon ): void {
		//
	}

	onSelected ( object: PropPolygon ): void {
		this.splineDebugService.showPolyline( object.spline, ColorUtils.RED );
	}

	onDefault ( object: PropPolygon ): void {
		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onUnselected ( object: PropPolygon ): void {
		this.splineDebugService.showPolyline( object.spline );
	}

	onAdded ( object: PropPolygon ): void {
		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onUpdated ( object: PropPolygon ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );

		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onRemoved ( object: PropPolygon ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );
	}

	onClearHighlight (): void {
		this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
		this.splineDebugService.clear();
	}


}


@Injectable()
export class PropPolygonPointVisualizer extends NodeVisualizer<PropPolygonPoint> {

	constructor () {
		super();
	}

	onAdded ( object: PropPolygonPoint ): void {
		super.onAdded( object );
		this.updateVisuals( object.mainObject );
	}

	onUpdated ( object: PropPolygonPoint ): void {
		super.onUpdated( object );
		this.updateVisuals( object.mainObject );
	}

	onRemoved ( object: PropPolygonPoint ): void {
		super.onRemoved( object );
		this.updateVisuals( object.mainObject );
	}

	onClearHighlight (): void {
		// this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
	}

}
