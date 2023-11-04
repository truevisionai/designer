import { Injectable } from '@angular/core';
import { RoadSplineService } from 'app/services/road/road-spline.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadCoordStrategy } from 'app/core/snapping/select-strategies/road-coord-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';
import { RoadNode } from 'app/modules/three-js/objects/road-node';

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolService {

	public pointStrategy: SelectStrategy<AbstractControlPoint>;
	public roadStrategy: SelectStrategy<TvRoadCoord>;
	public nodeStrategy: SelectStrategy<RoadNode>;

	constructor (
		public roadService: RoadService,
		public roadSplineService: RoadSplineService,
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointService: ControlPointFactory
	) {
		this.pointStrategy = new ControlPointStrategy();
		this.roadStrategy = new RoadCoordStrategy();
		this.nodeStrategy = new NodeStrategy<RoadNode>( RoadNode.lineTag, true );

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
