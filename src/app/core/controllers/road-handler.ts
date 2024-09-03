/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "app/map/models/tv-road.model";
import { Injectable } from "@angular/core";
import { EmptyController } from "./empty-controller";

@Injectable( {
	providedIn: 'root'
} )
export class RoadController extends EmptyController<TvRoad> {

}


