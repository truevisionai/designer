/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { DeleteCrossWalkCommand } from 'app/tools/marking-line/DeleteCrossWalkCommand';
import { CopyPositionCommand } from 'app/commands/copy-position-command';
import { RemoveArrayPointCommand } from 'app/commands/remove-array-point-command';
import { UpdateValueCommand } from 'app/commands/set-value-command';
import { TvColors } from 'app/modules/tv-map/models/tv-common';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';
import { Crosswalk } from "../../../modules/tv-map/models/objects/crosswalk";
import { TvCornerRoad } from "../../../modules/tv-map/models/objects/tv-corner-road";

export interface ICrosswalkInspectorData {
	crosswalk: Crosswalk;
	point?: TvCornerRoad;
}

@Component( {
	selector: 'app-crosswalk-inspector',
	templateUrl: './crosswalk-inspector.component.html',
	styleUrls: [ './crosswalk-inspector.component.scss' ]
} )
export class CrosswalkInspectorComponent extends BaseInspector implements IComponent {

	data: ICrosswalkInspectorData;

	isOpen: boolean = true;

	colors = TvColors;

	constructor () {

		super();

	}

	get position (): Vector3 {

		return this.data?.point?.position?.clone();

	}

	get marking (): TvObjectMarking {

		return this.data?.crosswalk?.marking;

	}

	onAttrChanged ( $value: any, property: keyof TvObjectMarking ) {

		if ( !this.marking ) return;

		const command = new UpdateValueCommand( this.marking, property, $value );

		CommandHistory.execute( command );

	}

	onPositionChanged ( $value: Vector3 ) {

		if ( !this.data.point ) return;

		const oldPosition = this.data.point.position.clone();

		const command = new CopyPositionCommand( this.data.point, $value, oldPosition );

		CommandHistory.execute( command );

	}

	deleteCrosswalk () {

		if ( !this.data.crosswalk ) return;

		const command = new DeleteCrossWalkCommand( this.data.crosswalk );

		CommandHistory.execute( command );

	}

	deletePoint () {

		if ( !this.data.point ) return;

		const points = this.data.crosswalk.outlines[ 0 ].cornerRoad;

		CommandHistory.executeMany(
			new RemoveArrayPointCommand( this.marking, points, this.data.point ),

			new SetInspectorCommand( null, null ),
		);

	}

}
