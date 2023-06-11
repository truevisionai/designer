import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OscManeuver } from 'app/modules/open-scenario/models/osc-maneuver';

@Component( {
    selector: 'app-edit-maneuver',
    templateUrl: './edit-maneuver.component.html'
} )
export class EditManeuverComponent implements OnInit {

    @Input() maneuver: OscManeuver;
    @Output() maneuverSelected = new EventEmitter<OscManeuver>();

    constructor () { }

    ngOnInit () {

    }

    onFocus () {

        this.maneuverSelected.emit( this.maneuver );

    }

}
