import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionConnection } from "../models/junctions/tv-junction-connection";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionManager {

	private debug = true;

	// addConnection ( junction: TvJunction, connection: TvJunctionConnection ) { }

}
