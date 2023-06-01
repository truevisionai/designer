/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { UpdateLaneOffsetDistanceCommand } from 'app/core/commands/update-lane-offset-distance-command';
import { UpdateLaneOffsetValueCommand } from 'app/core/commands/update-lane-offset-value-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { NodeFactoryService } from 'app/core/factories/node-factory.service';
import { IComponent } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';
import { LaneOffsetNode } from '../../../modules/three-js/objects/lane-offset-node';

@Component( {
	selector: 'app-lane-offset-inspector',
	templateUrl: './lane-offset-inspector.component.html'
} )
export class LaneOffsetInspector extends BaseInspector implements IComponent {

	public static valueChanged = new EventEmitter<LaneOffsetNode>();

	public static offsetChanged = new EventEmitter<number>();
	public static distanceChanged = new EventEmitter<number>();

	public data: TvRoadLaneOffset;

	public laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

	constructor () {

		super();

	}

	onDistanceChanged ( $value: number ) {

		CommandHistory.execute( new UpdateLaneOffsetDistanceCommand( this.data.node, $value, null, this.laneHelper ) );

	}

	onOffsetChanged ( $value ) {

		CommandHistory.execute( new UpdateLaneOffsetValueCommand( this.data.node, $value, null, this.laneHelper ) );

	}

}
