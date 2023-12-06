import { Injectable } from '@angular/core';
import { RoadSplineService } from 'app/services/road/road-spline.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SelectionService } from '../selection.service';
import { RoadLinkService } from 'app/services/road/road-link.service';
import { RoadDebugService } from "../../services/debug/road-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolService {

	// public pointStrategy: SelectStrategy<AbstractControlPoint>;
	// public roadStrategy: SelectStrategy<TvRoadCoord>;
	// public nodeStrategy: SelectStrategy<RoadNode>;

	constructor (
		public selection: SelectionService,
		public roadService: RoadService,
		public roadSplineService: RoadSplineService,
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointService: ControlPointFactory,
		public roadLinkService: RoadLinkService,
		public debug: RoadDebugService,
	) {
		// this.pointStrategy = new ControlPointStrategy();
		// this.roadStrategy = new RoadCoordStrategy();
		// this.nodeStrategy = new NodeStrategy<RoadNode>( RoadNode.lineTag, true );

		// this.pointStrategy.map = this.mapService;
		// this.roadStrategy.map = this.mapService;
	}

	hideRoad ( road: TvRoad ) {

		this.roadService.hideControlPoints( road );
		this.roadService.hideSpline( road );

	}

	showRoad ( road: TvRoad ) {

		this.roadService.showControlPoints( road );
		this.roadService.showSpline( road );

	}

}
