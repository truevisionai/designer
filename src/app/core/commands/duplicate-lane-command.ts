/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { BaseCommand } from './base-command';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';

export class DuplicateLaneCommand extends BaseCommand {

	private road: TvRoad;

	private laneSection: TvLaneSection;

	private newLane: TvLane;

	constructor ( oldLane: TvLane, private laneHelper: OdLaneReferenceLineBuilder ) {

		super();

		this.newLane = oldLane.clone();

		this.road = this.map.getRoadById( oldLane.roadId );

		this.laneSection = this.road.getLaneSectionById( oldLane.laneSectionId );

	}

	execute (): void {

		this.laneSection.addLaneInstance( this.newLane, true );

		this.rebuild();
	}

	undo (): void {

		this.laneSection.removeLaneById( this.newLane.id );

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
