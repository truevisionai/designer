/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/tv-condition';


@Component( {
	selector: 'app-base-condition-editor-component',
	template: '',
} )
export abstract class BaseConditionEditorComponent {

	@Input() condition: AbstractCondition;

}
