import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { OscTrajectory } from '../../models/osc-trajectory';
import { Debug } from 'app/core/utils/debug';

@Component( {
    selector: 'app-osc-trajectories-inspector',
    templateUrl: './osc-trajectories-inspector.component.html',
    styleUrls: [ './osc-trajectories-inspector.component.css' ]
} )
export class OscTrajectoriesInspectorComponent implements OnInit, IComponent {

    data: OscTrajectory[] = [];

    get trajectories () { return this.data };

    selected: any;

    constructor () { }

    ngOnInit () {

        Debug.log( this.data );

    }

    selectTrajectory ( trajectory ) {

        this.selected = trajectory;

    }

    isDisabled ( trajectory: OscTrajectory ) {

        return trajectory !== this.selected;

    }
}
