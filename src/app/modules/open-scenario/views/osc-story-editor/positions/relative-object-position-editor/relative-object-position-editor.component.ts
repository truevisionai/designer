import { Component, Input, OnInit } from '@angular/core';
import { OscRelativeObjectPosition } from '../../../../models/positions/osc-relative-object-position';
import { OscSourceFile } from '../../../../services/osc-source-file';

@Component( {
    selector: 'app-relative-object-position-editor',
    templateUrl: './relative-object-position-editor.component.html',
} )
export class RelativeObjectPositionEditorComponent implements OnInit {

    get entities () {
        return [...OscSourceFile.openScenario.objects.keys()];
    };

    @Input() position: OscRelativeObjectPosition;

    constructor () {
    }

    ngOnInit () {
    }

}
