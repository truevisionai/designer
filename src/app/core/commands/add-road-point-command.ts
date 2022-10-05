/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/core/factories/road-factory.service';
import { AppInspector } from 'app/core/inspector';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';

export class AddRoadPointCommand extends OdBaseCommand {

	constructor ( private road: TvRoad, private newPoint: RoadControlPoint, private oldPoint: RoadControlPoint ) {

		super();

	}

	execute (): void {

		AppInspector.setInspector( RoadInspector, { road: this.road, controlPoint: this.newPoint } );

	}

	undo (): void {

		RoadFactory.removeControlPoint( this.road, this.newPoint );

		AppInspector.setInspector( RoadInspector, { road: this.road, controlPoint: this.oldPoint } );

	}

	redo (): void {

		RoadFactory.addControlPointNew( this.road, this.newPoint );

		AppInspector.setInspector( RoadInspector, { road: this.road, controlPoint: this.newPoint } );
	}

}
