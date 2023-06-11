import { Component, Input, OnInit } from '@angular/core';
import { AbstractAction, AbstractPrivateAction } from 'app/modules/open-scenario/models/osc-interfaces';
import { OscEntityObject } from '../../../models/osc-entities';

@Component( {
    selector: 'app-action-editor',
    templateUrl: './action-editor.component.html',
    styleUrls: ['./action-editor.component.css']
} )
export class ActionEditorComponent implements OnInit {

    @Input() action: AbstractPrivateAction;

    @Input() entity: OscEntityObject;

    constructor () {


    }

    ngOnInit () {


    }

}
