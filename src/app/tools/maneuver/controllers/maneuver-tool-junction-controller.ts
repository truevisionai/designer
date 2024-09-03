/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "../../../core/object-handlers/empty-controller";
import { TvJunctionSignalizationInspector } from "../../traffic-light/tv-junction-signalization.inspector";
import { JunctionOverlay } from "app/services/junction/junction-overlay";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionOverlayController extends EmptyController<JunctionOverlay> {

	showInspector ( object: JunctionOverlay ): void {

		this.setInspector( new TvJunctionSignalizationInspector( object.junction ) );

	}

}
