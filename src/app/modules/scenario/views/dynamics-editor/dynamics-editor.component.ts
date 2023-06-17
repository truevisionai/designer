/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DynamicsDimension, DynamicsShape } from 'app/modules/scenario/models/tv-enums';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { TransitionDynamics } from '../../models/actions/transition-dynamics';

@Component( {
	selector: 'app-dynamics-editor',
	templateUrl: './dynamics-editor.component.html',
	styleUrls: [ './dynamics-editor.component.css' ]
} )
export class DynamicsEditorComponent {

	@Input() dynamics: TransitionDynamics;

	shapes = DynamicsShape;

	dimensions = DynamicsDimension;

	onShapeChanged ( $event: DynamicsShape ) {

		CommandHistory.execute( new SetValueCommand( this.dynamics, 'shape', $event ) );

	}

	onDimensionChanged ( $event: DynamicsDimension ) {

		CommandHistory.execute( new SetValueCommand( this.dynamics, 'dimension', $event ) );

	}

	onValueChanged ( $event: number ) {

		CommandHistory.execute( new SetValueCommand( this.dynamics, 'dimensionValue', $event ) );

	}

}
