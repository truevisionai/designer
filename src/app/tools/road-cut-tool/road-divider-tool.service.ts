import { Injectable } from '@angular/core';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { MapService } from 'app/services/map.service';
import { RoadDebugService } from 'app/services/debug/road-debug.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerToolService {

	constructor (
		public dividerService: RoadDividerService,
		public base: BaseToolService,
		public debugService: DebugDrawService,
		public roadDebug: RoadDebugService,
		public roadService: RoadService,
	) { }

}
