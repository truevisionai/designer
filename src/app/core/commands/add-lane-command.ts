/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { BaseCommand } from './base-command';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';

export class AddLaneCommand extends BaseCommand {

	private road: TvRoad;

	private laneSection: TvLaneSection;

	private lane: TvLane;

	constructor ( lane: TvLane, private laneHelper: OdLaneReferenceLineBuilder ) {

		super();

		this.lane = lane.clone();

		this.road = this.map.getRoadById( lane.roadId );

		this.laneSection = this.road.getLaneSectionById( lane.laneSectionId );

	}

	execute (): void {

		this.laneSection.addLaneInstance( this.lane, true );

		this.rebuild();
	}

	undo (): void {

		this.laneSection.removeLaneById( this.lane.id );

		this.rebuild();

	}

	redo (): void {

		this.execute();

	}

	rebuild (): void {

		SceneService.removeWithChildren( this.road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, this.road );

		this.laneHelper.redraw( LineType.SOLID );
	}

}
