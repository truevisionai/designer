import { Component, Input, OnInit } from '@angular/core';
import { OscPositionAction } from '../../../../../models/actions/osc-position-action';
import { OscEntityObject } from '../../../../../models/osc-entities';
import { AbstractPosition } from '../../../../../models/osc-interfaces';

@Component( {
    selector: 'app-position-action-editor',
    templateUrl: './position-action-editor.component.html'
} )
export class PositionActionEditorComponent implements OnInit {

    @Input() action: OscPositionAction;
    @Input() entity: OscEntityObject;

    constructor () {

    }

    ngOnInit () {


    }

    onPositionChanged ( $event: AbstractPosition ) {

        this.action.position = $event;


        if ( this.entity ) this.action.execute( this.entity );

    }

    onPositionModified ( $event: AbstractPosition ) {

        this.action.position = $event;

        if ( this.entity ) this.action.execute( this.entity );

    }

}
