/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { PointMarkingControlPoint } from "../objects/point-marking-object";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingVisualizer extends NodeVisualizer<PointMarkingControlPoint> {

	constructor () {
		super();
	}


}
