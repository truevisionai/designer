import { Component, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { CopyPositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { SetValueCommand, UpdateValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { TvColors } from 'app/modules/tv-map/models/tv-common';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { Crosswalk, TvCornerRoad } from 'app/modules/tv-map/models/tv-road-object';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';

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

		return this.data?.point?.position?.clone()

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

}
