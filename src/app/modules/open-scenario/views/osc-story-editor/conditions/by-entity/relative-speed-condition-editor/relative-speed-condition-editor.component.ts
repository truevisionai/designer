import { Component, OnInit } from '@angular/core';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
    selector: 'app-relative-speed-condition-editor',
    templateUrl: './relative-speed-condition-editor.component.html',
    styleUrls: [ './relative-speed-condition-editor.component.css' ]
} )
export class RelativeSpeedConditionEditorComponent extends BaseConditionEditorComponent {

    constructor () {
        super();
    }

    ngOnInit () {
    }

}
