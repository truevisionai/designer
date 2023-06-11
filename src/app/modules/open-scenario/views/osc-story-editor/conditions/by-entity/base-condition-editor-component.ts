import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';
import { Input } from '@angular/core';

export abstract class BaseConditionEditorComponent {

    @Input() condition: AbstractCondition;

}