import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { BaseController } from "app/core/controllers/base-controller";
import { AutoSpline } from "app/core/shapes/auto-spline-v2";
import { PointerEventData } from "app/events/pointer-event-data";
import { SplineGeometryService } from "app/services/spline/spline-geometry.service";
import { SplineService } from "app/services/spline/spline.service";
import { SplineUtils } from "app/utils/spline.utils";

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineController extends BaseController<AutoSpline> {

	constructor (
		private splineService: SplineService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	isDraggingSupported (): boolean {

		return true;

	}

	onAdded ( object: AutoSpline ): void {

		this.splineService.add( object );

	}

	onUpdated ( object: AutoSpline ): void {

		this.splineService.updateSpline( object );

	}

	onRemoved ( object: AutoSpline ): void {

		this.splineService.remove( object );

	}

	onDrag ( object: AutoSpline, e: PointerEventData ): void {

		if ( SplineUtils.isConnectedToJunction( object ) ) {
			this.setHint( 'Moving spline connected with junction is not supported. Add control points to modify spline.' );
			return;
		}

		object.getControlPoints().forEach( point => {

			point.position.add( this.dragDelta );

		} );

		this.splineGeometryService.updateGeometryAndBounds( object );

	}

	onDragEnd ( object: AutoSpline, e: PointerEventData ): void {

		const delta = this.dragStartPosition.clone().sub( this.dragEndPosition );

		Commands.DragSpline( object, delta );

	}

}
