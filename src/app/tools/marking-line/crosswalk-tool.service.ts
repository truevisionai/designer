import { Injectable } from '@angular/core';
import { BaseToolService } from "../base-tool.service";
import { RoadObjectService } from "./road-object.service";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolService {

	constructor (
		public base: BaseToolService,
		public objectService: RoadObjectService,
	) {
	}
}
