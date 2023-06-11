import { Component, OnInit, Input } from '@angular/core';
import { OscDistanceCondition } from 'app/modules/open-scenario/models/conditions/osc-distance-condition';
import { AbstractPosition } from 'app/modules/open-scenario/models/osc-interfaces';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { OscEditorComponent } from 'app/modules/open-scenario/views/osc-editor/osc-editor.component';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
    selector: 'app-distance-condition-editor',
    templateUrl: './distance-condition-editor.component.html',
    styleUrls: [ './distance-condition-editor.component.css' ]
} )
export class DistanceConditionEditorComponent extends BaseConditionEditorComponent {

    @Input() condition: OscDistanceCondition;

    constructor () {

        super();

    }

    onPositionChanged ( position: AbstractPosition ) {

        // this.condition.position = position;

        const cmd = ( new SetValueCommand( this.condition, 'position', position ) );

        OscEditorComponent.execute( cmd );

    }

}
