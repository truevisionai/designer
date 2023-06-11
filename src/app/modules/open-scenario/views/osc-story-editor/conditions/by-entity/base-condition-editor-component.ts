import { Component, Input } from '@angular/core';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';


@Component( {
	selector: 'app-base-condition-editor-component',
	template: '',
} )
export abstract class BaseConditionEditorComponent {

	@Input() condition: AbstractCondition;

}
