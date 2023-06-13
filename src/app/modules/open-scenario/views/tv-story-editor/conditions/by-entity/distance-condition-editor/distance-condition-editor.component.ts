/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DistanceCondition } from 'app/modules/open-scenario/models/conditions/tv-distance-condition';
import { AbstractPosition } from 'app/modules/open-scenario/models/tv-interfaces';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from '../../../../../../../services/command-history';
import { AbstractByEntityCondition } from '../../../../../models/conditions/tv-condition';
import { Rule } from '../../../../../models/tv-enums';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-distance-condition-editor',
	templateUrl: './distance-condition-editor.component.html',
	styleUrls: [ './distance-condition-editor.component.css' ]
} )
export class DistanceConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: AbstractByEntityCondition;

	rules = Rule;

	constructor () {

		super();

	}

	get distanceCondition () {

		return this.condition as DistanceCondition;

	}

	onPositionChanged ( position: AbstractPosition ) {

		CommandHistory.execute(
			new SetValueCommand( this.distanceCondition, 'position', position )
		);

	}

}
