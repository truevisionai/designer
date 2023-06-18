/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DynamicsDimension, DynamicsShape } from 'app/modules/scenario/models/tv-enums';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { TransitionDynamics } from '../../models/actions/transition-dynamics';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { EnumHelper } from 'app/modules/tv-map/models/tv-common';

@Component( {
	selector: 'app-dynamics-editor',
	templateUrl: './dynamics-editor.component.html',
	styleUrls: [ './dynamics-editor.component.css' ]
} )
export class DynamicsEditorComponent {

	@Input() dynamics: TransitionDynamics;

	shapes = DynamicsShape;

	dimensions = DynamicsDimension;

	get suffix () {

		return EnumHelper.getSuffix( this.dynamics.dynamicsDimension );

	}

	onShapeChanged ( $event: DynamicsShape ) {

		console.log( $event );

		this.dynamics.dynamicsShape = $event;

		// CommandHistory.execute( new SetValueCommand( this.dynamics, 'dynamicsShape', $event ) );

	}

	onDimensionChanged ( $event: DynamicsDimension ) {

		console.log( $event );

		this.dynamics.dynamicsDimension = $event;

		// CommandHistory.execute( new SetValueCommand( this.dynamics, 'dynamicsDimension', $event ) );

	}

	onValueChanged ( $event: number ) {

		console.log( $event );

		this.dynamics.value = $event;

		// CommandHistory.execute( new SetValueCommand( this.dynamics, 'value', $event ) );

	}

}
