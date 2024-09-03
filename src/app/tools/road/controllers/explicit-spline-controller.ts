import { Injectable } from "@angular/core";
import { AutoSpline } from "../../../core/shapes/auto-spline-v2";
import { AppInspector } from "../../../core/inspector";
import { RoadInspector } from "../../../views/inspectors/road-inspector/road-inspector.component";
import { SplineController } from "./spline-controller";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineController extends SplineController {

	showInspector ( object: AutoSpline ): void {

		AppInspector.setInspector( RoadInspector, { spline: object } );

	}

}
