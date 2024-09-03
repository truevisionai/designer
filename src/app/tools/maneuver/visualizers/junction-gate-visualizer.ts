/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateVisualizer extends NodeVisualizer<JunctionGatePoint> { }
