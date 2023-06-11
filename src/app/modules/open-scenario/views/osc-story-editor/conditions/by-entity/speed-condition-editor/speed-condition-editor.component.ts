import { Component, Input } from '@angular/core';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';
import { OscSpeedCondition } from 'app/modules/open-scenario/models/conditions/osc-speed-condition';

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
