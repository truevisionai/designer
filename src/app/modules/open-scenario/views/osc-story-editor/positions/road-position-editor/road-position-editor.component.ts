import { Component, Input, OnInit } from '@angular/core';
import { OscRoadPosition } from '../../../../models/positions/osc-road-position';

@Component( {
    selector: 'app-road-position-editor',
    templateUrl: './road-position-editor.component.html'
} )
export class RoadPositionEditorComponent implements OnInit {

    @Input() position: OscRoadPosition;

    constructor () {
    }

    ngOnInit () {
    }

}
