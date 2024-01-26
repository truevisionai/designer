/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DynamicsDimension, DynamicsShape } from 'app/scenario/models/tv-enums';
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

	get dimensionValueLabel () {

		return this.dynamics.getDimensionAsString();

	}

	get suffix () {

		return this.dynamics.getDimensionSuffix();

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
