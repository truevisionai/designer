/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { NewRoadDialogComponent } from '../../modules/tv-map/dialogs/new-road-dialog/new-road-dialog.component';
import { KeyboardInput } from '../../core/input';
import { CommandHistory } from '../../services/command-history';
import { MainFileService } from 'app/services/main-file.service';
import { TvConsole } from 'app/core/utils/console';

@Component( {
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: [ './editor.component.css' ],
} )
export class EditorComponent implements OnInit, AfterContentInit {

    constructor (
        private dialog: MatDialog,
        private analytics: AnalyticsService,
        private mainFileService: MainFileService
    ) {

    }

    get consoleLabel () {

        if ( TvConsole.logs.length > 0 ) return `Console (${ TvConsole.logs.length })`;

        return 'Console';
    }

    ngOnInit () {

        this.mainFileService.newFile();

    }

    ngAfterContentInit (): void {

        // setTimeout( () => {

        //     this.showNewScenarioDialog();

        // }, 300 );

    }

    showNewScenarioDialog () {

        this.dialog.open( NewRoadDialogComponent, {
            width: '680px',
            height: '680px',
            data: null,
            disableClose: true
        } );

    }

    @HostListener( 'document:keydown', [ '$event' ] )
    onKeyDown ( e: KeyboardEvent ) {

        KeyboardInput.OnKeyDown( e );

        if ( e.keyCode === 90 && e.ctrlKey ) {
            CommandHistory.undo();
        }

        if ( e.keyCode === 89 && e.ctrlKey ) {
            CommandHistory.redo();
        }
    }

    @HostListener( 'document:keyup', [ '$event' ] )
    onKeyUp ( e: KeyboardEvent ) {

        KeyboardInput.OnKeyUp( e );

    }

}
