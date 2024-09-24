/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AppInspector } from "../../../core/inspector";
import { RoadInspector } from "../../../views/inspectors/road-inspector/road-inspector.component";
import { SplineController } from "./spline-controller";
import { ExplicitSpline } from "app/core/shapes/explicit-spline";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineController extends SplineController<ExplicitSpline> {

	showInspector ( object: ExplicitSpline ): void {

		AppInspector.setInspector( RoadInspector, { spline: object } );

	}

	onAdded ( object: ExplicitSpline ): void {

		object.updateIndexes();

		super.onAdded( object );

	}

	onUpdated ( object: ExplicitSpline ): void {

		object.updateIndexes();

		super.onUpdated( object );

	}

	onRemoved ( object: ExplicitSpline ): void {

		object.updateIndexes();

		super.onRemoved( object );

	}

}
