/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DistanceCondition } from 'app/modules/open-scenario/models/conditions/osc-distance-condition';
import { AbstractPosition } from 'app/modules/open-scenario/models/osc-interfaces';
import { EditorComponent } from 'app/modules/open-scenario/views/osc-editor/osc-editor.component';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-distance-condition-editor',
	templateUrl: './distance-condition-editor.component.html',
	styleUrls: [ './distance-condition-editor.component.css' ]
} )
export class DistanceConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: DistanceCondition;

	constructor () {

		super();

	}

	onPositionChanged ( position: AbstractPosition ) {

		// this.condition.position = position;

		const cmd = ( new SetValueCommand( this.condition, 'position', position ) );

		EditorComponent.execute( cmd );

	}

}
