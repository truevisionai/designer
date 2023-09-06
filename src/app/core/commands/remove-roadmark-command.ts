/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../modules/tv-map/models/tv-lane-road-mark';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { TvRoadMarkBuilderV2 } from 'app/modules/tv-map/builders/tv-road-mark-builder-v2';

export class RemoveRoadmarkCommand extends BaseCommand {

	private index: number;

	private roadMarkBuilder = new TvRoadMarkBuilderV2();

	constructor ( private roadmark: TvLaneRoadMark, private lane: TvLane ) {

		super();

	}

	execute (): void {

		this.lane.gameObject.remove( this.roadmark.gameObject );

		SceneService.remove( this.roadmark.node );

		this.removeFromLane();

		this.rebuild();
	}

	undo (): void {

		this.lane.gameObject.add( this.roadmark.gameObject );

		SceneService.add( this.roadmark.node );

		this.lane.addRoadMarkInstance( this.roadmark );

		this.rebuild();
	}

	redo (): void {

		this.execute();

	}

	private rebuild () {

		this.map.roads.forEach( road => {

			this.roadMarkBuilder.buildRoad( road );

		} );

	}

	private removeFromLane () {

		this.lane.getRoadMarks().forEach( ( ( value, i ) => {

			if ( value.sOffset === this.roadmark.sOffset ) {

				this.index = i;

			}

		} ) );

		this.lane.getRoadMarks().splice( this.index, 1 );

	}
}
