/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/controllers/empty-controller";
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateController extends EmptyController<JunctionGatePoint> {


}

