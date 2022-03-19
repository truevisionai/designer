/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ElectronService } from 'ngx-electron';
import { RecentFileService } from 'app/services/recent-file.service';
import { IFile } from 'app/core/models/file';
import { MainFileService } from 'app/services/main-file.service';

@Component( {
    selector: 'app-new-road-dialog',
    templateUrl: './new-road-dialog.component.html',
    styleUrls: [ './new-road-dialog.component.css' ]
} )
export class NewRoadDialogComponent implements OnInit {

    constructor (
        private dialogRef: MatDialogRef<NewRoadDialogComponent>,
        private electron: ElectronService,
        private recentFileService: RecentFileService,
        private mainFileService: MainFileService
    ) {
    }

    get recentFiles () {

        return this.recentFileService.recentFiles;

    }

    get isElectronApp () {

        return this.electron.isElectronApp;

    }

    ngOnInit () {

        // console.log( this.recentFileService.recentFiles );

    }

    createNew () {

        this.mainFileService.newFile();

        // this.oscService.newFile();

        this.dialogRef.close();

    }

    openFromComputer () {

        this.mainFileService.showOpenWindow();

        this.dialogRef.close();

    }

    openFile ( file: IFile ) {

        this.mainFileService.openFromPath( file.path, () => {

            this.dialogRef.close();

        } );

    }

    public fileChange ( event ) {

        const self = this;

        const reader = new FileReader();

        if ( event.target.files && event.target.files.length > 0 ) {

            const file = event.target.files[ 0 ];

            reader.readAsText( file );

            reader.onload = ( data ) => {

                self.mainFileService.importViaContent( reader.result as string );

                self.dialogRef.close();

            };
        }

    }
}
