/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { SpeedCondition } from 'app/modules/scenario/models/conditions/tv-speed-condition';
import { CommandHistory } from '../../../../../services/command-history';
import { SetValueCommand } from '../../../../three-js/commands/set-value-command';
import { Condition } from '../../../models/conditions/tv-condition';
import { Rule } from '../../../models/tv-enums';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-speed-condition-editor',
	templateUrl: './speed-condition-editor.component.html',
} )
export class SpeedConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: Condition;

	rules = Rule;

	get speedCondition (): SpeedCondition {

		return this.condition as SpeedCondition;

	}

	constructor () {

		super();

	}

	onSpeedChanged ( $value: number ) {

		CommandHistory.execute(
			new SetValueCommand( this.speedCondition, 'value', $value )
		);

	}

	onRuleChanged ( $rule: Rule ) {

		CommandHistory.execute(
			new SetValueCommand( this.speedCondition, 'rule', $rule )
		);

	}
}
