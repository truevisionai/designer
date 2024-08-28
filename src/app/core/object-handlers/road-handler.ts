/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "app/map/models/tv-road.model";
import { Injectable } from "@angular/core";
import { EmptyObjectHandler } from "./empty-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class RoadHandler extends EmptyObjectHandler<TvRoad> {

}


