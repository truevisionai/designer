import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';
import { Component, Input } from '@angular/core';


@Component( {
	selector: 'app-base-condition-editor-component',
	template: '',
} )
export abstract class BaseConditionEditorComponent {

    @Input() condition: AbstractCondition;

}
