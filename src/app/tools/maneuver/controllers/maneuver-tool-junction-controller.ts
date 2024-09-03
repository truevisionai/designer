/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "../../../core/object-handlers/empty-controller";
import { TvJunction } from "../../../map/models/junctions/tv-junction";
import { TvJunctionSignalizationInspector } from "../../traffic-light/tv-junction-signalization.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionController extends EmptyController<TvJunction> {

	showInspector ( object: TvJunction ): void {

		this.setInspector( new TvJunctionSignalizationInspector( object ) );

	}

}