/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { OscSpeedCondition } from 'app/modules/open-scenario/models/conditions/osc-speed-condition';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-speed-condition-editor',
	templateUrl: './speed-condition-editor.component.html',
} )
export class SpeedConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: OscSpeedCondition;

	constructor () {

		super();

	}

	onSpeedChanged ( $value: any ) {

		this.condition.value = $value;

	}

	onRuleChanged ( $rule: any ) {

		this.condition.rule = $rule;

	}
}
