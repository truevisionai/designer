/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";
import { JunctionGatePoint } from "app/objects/junction-gate-point";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateOverlayHandler extends NodeOverlayHandler<JunctionGatePoint> { }
