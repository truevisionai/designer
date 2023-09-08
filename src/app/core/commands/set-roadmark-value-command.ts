/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneRoadMark } from '../../modules/tv-map/models/tv-lane-road-mark';
import { BaseCommand } from './base-command';
import { TvRoadMarkBuilderV2 } from 'app/modules/tv-map/builders/tv-road-mark-builder-v2';

export class SetRoadmarkValueCommand extends BaseCommand {

	private readonly oldValue: any;

	private roadMarkBuilder = new TvRoadMarkBuilderV2();

	constructor (
		private roadmark: TvLaneRoadMark,
		private attribute: any,
		private newValue: any,
	) {

		super();

		this.oldValue = this.roadmark[ this.attribute ];

	}

	execute (): void {

		this.roadmark[ this.attribute ] = this.newValue;

		this.rebuild();

	}

	undo (): void {

		this.roadmark[ this.attribute ] = this.oldValue;

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
}
