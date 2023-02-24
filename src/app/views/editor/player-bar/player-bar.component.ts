/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { PlayerService } from '../../../core/player.service';

@Component( {
    selector: 'app-player-bar',
    templateUrl: './player-bar.component.html',
    styleUrls: [ './player-bar.component.css' ]
} )
export class PlayerBarComponent {

    public isPlaying: boolean;
    public hasStarted: boolean;

    // reference to handle
    private handle: any;

    constructor ( private playerService: PlayerService ) {
    }

    playSimulation () {

        if ( this.isPlaying ) return;

        this.isPlaying = true;

        this.playerService.play();

        this.hasStarted = true;
    }

    pauseSimulation () {

        if ( !this.isPlaying ) return;

        this.isPlaying = false;

        this.playerService.pause();

    }

    stopSimulation () {

        if ( !this.hasStarted ) return;

        this.isPlaying = false;

        this.playerService.stop();

        this.hasStarted = false;
    }

    playSingleSimulationStep () {

        this.playSimulation();

        this.pauseSimulation();

    }

    onMouseDown () {

        this.handle = setInterval( () => this.playSingleSimulationStep(), 20 );

    }

    onMouseUp () {

        clearInterval( this.handle );

    }
}
