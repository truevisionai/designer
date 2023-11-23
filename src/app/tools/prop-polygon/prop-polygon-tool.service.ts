import { Injectable } from '@angular/core';
import { MapService } from "../../services/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonToolService {

	constructor (
		public mapService: MapService,
	) {
	}
}
