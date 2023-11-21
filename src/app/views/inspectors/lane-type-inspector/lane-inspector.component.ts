/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
// import { DuplicateLaneCommand } from 'app/commands/duplicate-lane-command';
// import { SetInspectorCommand } from 'app/commands/set-inspector-command';
// import { UpdateValueCommand } from 'app/commands/set-value-command';
// import { RemoveLaneCommand } from '../../../commands/remove-lane-command';
import { BaseInspector } from '../../../core/components/base-inspector.component';
import { IComponent } from '../../../core/game-object';
import { TravelDirection, TvLaneType } from '../../../modules/tv-map/models/tv-common';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
// import { CommandHistory } from '../../../services/command-history';

@Component( {
	selector: 'app-lane-type-inspector',
	templateUrl: './lane-inspector.component.html',
} )
export class LaneInspectorComponent extends BaseInspector implements IComponent {

	public data: TvLane;

	public directions = TravelDirection;

	get types () {
		return TvLaneType;
	}

	get lane (): TvLane {
		return this.data;
	}

	deleteLane () {

		// if ( !this.lane ) return;

		// CommandHistory.executeMany(
		// 	new RemoveLaneCommand( this.lane ),

		// 	new SetInspectorCommand( null, null )
		// );

	}

	duplicateLane () {

		// if ( !this.lane ) return;

		// CommandHistory.execute( new DuplicateLaneCommand( this.lane ) );
	}

	onLevelChanged ( $level: boolean ) {

		// if ( !this.lane ) return;

		// CommandHistory.execute( new UpdateValueCommand( this.lane, 'level', $level ) );
	}

	onTypeChanged ( $type: TvLaneType ) {

		// if ( !this.lane ) return;

		// CommandHistory.execute( new UpdateValueCommand( this.lane, 'type', $type ) );
	}

	onTravelDirectionChanged ( $direction: TravelDirection ) {

		// if ( !this.lane ) return;

		// CommandHistory.execute( new UpdateValueCommand( this.lane, 'direction', $direction ) );
	}

	onMaterialChanged ( $value: string ) {

		// if ( !this.lane ) return;

		// CommandHistory.execute( new UpdateValueCommand( this.lane, 'threeMaterialGuid', $value ) );
	}

}
