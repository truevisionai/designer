/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { SpeedCondition } from 'app/scenario/models/conditions/tv-speed-condition';
import { Condition } from '../../../models/conditions/tv-condition';
import { Rule } from '../../../models/tv-enums';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';
import { Commands } from 'app/commands/commands';

@Component( {
	selector: 'app-speed-condition-editor',
	templateUrl: './speed-condition-editor.component.html',
} )
export class SpeedConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: Condition;

	rules = Rule;

	constructor () {

		super();

	}

	get speedCondition (): SpeedCondition {

		return this.condition as SpeedCondition;

	}

	onSpeedChanged ( $value: number ): void {

		Commands.SetValue( this.speedCondition, 'value', $value );

	}

	onRuleChanged ( $rule: Rule ): void {

		Commands.SetValue( this.speedCondition, 'rule', $rule );

	}
}
