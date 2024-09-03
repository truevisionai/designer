/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "../../../core/visualizers/node-visualizer";
import { JunctionGateLine } from "../../../services/junction/junction-gate-line";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineVisualizer extends NodeVisualizer<JunctionGateLine> {

}