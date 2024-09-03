/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "../../../core/controllers/empty-controller";
import { JunctionGateLine } from "../../../services/junction/junction-gate-line";
import { JunctionGateInspector } from "../junction-gate-inspector";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineController extends EmptyController<JunctionGateLine> {

	showInspector ( object: JunctionGateLine ): void {

		this.setInspector( new JunctionGateInspector() );

	}

}