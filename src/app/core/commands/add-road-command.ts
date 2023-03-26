/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from 'app/core/inspector';
import { SceneService } from 'app/core/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';

export class AddRoadCommand extends OdBaseCommand {

	constructor ( private road: TvRoad, private point: RoadControlPoint ) {

		super();

	}

	execute (): void {

		AppInspector.setInspector( RoadInspector, { road: this.road, controlPoint: this.point } );

	}

	undo (): void {

		this.road.spline.removeControlPoint( this.point );

		SceneService.remove( this.point );

		this.road.spline.hide();

		this.map.removeRoad( this.road );

		AppInspector.clear();
	}

	redo (): void {

		this.road.spline.addControlPoint( this.point );

		SceneService.add( this.point );

		this.road.spline.show();

		this.map.addRoadInstance( this.road );

		AppInspector.setInspector( RoadInspector, { road: this.road, controlPoint: this.point } );
	}


}
