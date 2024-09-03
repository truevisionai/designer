/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "../../../core/object-handlers/empty-controller";
import { JunctionOverlay } from "../../../services/junction/junction-overlay";
import { TvJunctionSignalizationInspector } from "../tv-junction-signalization.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightJunctionController extends EmptyController<JunctionOverlay> {

	showInspector ( object: JunctionOverlay ): void {

		this.setInspector( new TvJunctionSignalizationInspector( object.junction ) );

	}

}