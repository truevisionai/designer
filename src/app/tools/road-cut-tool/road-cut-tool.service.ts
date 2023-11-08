import { Injectable } from '@angular/core';
import { RoadCuttingService } from 'app/services/road/road-cutter.service';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { MapService } from 'app/services/map.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadCutToolService {

	constructor (
		public cutting: RoadCuttingService,
		public base: BaseToolService,
		public roadService: RoadService,
		public debugService: DebugDrawService,
		public mapService: MapService,
	) { }

}
