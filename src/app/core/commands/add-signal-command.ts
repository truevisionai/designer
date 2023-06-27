/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ObjectSelection } from 'app/core/selection';
import { TvMapBuilder } from '../../modules/tv-map/builders/tv-map-builder';
import { TvRoadSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { OdBaseCommand } from './od-base-command';

export class AddSignalCommand extends OdBaseCommand {

	constructor ( public signal: TvRoadSignal ) {
		super();
	}

	get road () {

		return this.map.getRoadById( this.signal.roadId );

	}

	execute (): void {

		TvMapBuilder.makeRoadSignal( this.road, this.signal );

		this.road.addSignal( this.signal );

		// ObjectSelection.ActiveGameObject = this.signal.GameObject;

	}

	undo (): void {

		this.signal.gameObject.parent.remove( this.signal.gameObject );

		this.road.removeSignal( this.signal );

		ObjectSelection.removeActive();

	}

	redo (): void {

		this.execute();

	}
}
