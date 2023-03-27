/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { IFile } from 'app/core/models/file';
import { Environment } from 'app/core/utils/environment';
import { OdWriter } from 'app/modules/tv-map/services/open-drive-writer.service';
import { ExporterService } from 'app/services/exporter.service';
import { MainFileService } from 'app/services/main-file.service';
import { RecentFileService } from 'app/services/recent-file.service';
import { RoadExporterService } from 'app/services/road-style-exporter.service';
import { TvElectronService } from 'app/services/tv-electron.service';

import { AppService } from '../../../core/services/app.service';
import { NewRoadDialogComponent } from '../../../modules/tv-map/dialogs/new-road-dialog/new-road-dialog.component';
import { TvMapService } from '../../../modules/tv-map/services/tv-map.service';
import { AppLinks } from '../../../services/app-links';
import { CommandHistory } from '../../../services/command-history';
import { ExportGlbDialog } from '../dialogs/export-glb-dialog/export-glb-dialog.component';


@Component( {
    selector: 'app-menu-bar',
    templateUrl: './menu-bar.component.html',
} )
export class MenuBarComponent implements OnInit {

    constructor (
        private appService: AppService,
        private odService: TvMapService,
        private electron: TvElectronService,
        private dialog: MatDialog,
        private http: HttpClient,
        private exporter: ExporterService,
        private router: Router,
        private recentFileService: RecentFileService,
        private mainFileService: MainFileService,
        private odExporter: OdWriter,
        private roadStyleExporter: RoadExporterService
    ) {
    }

    get oscEnabled (): boolean {
        return Environment.oscEnabled;
    }

    get recentFiles () {
        return this.recentFileService.recentFiles;
    }

    get isElectronApp () {

        return this.electron.isElectronApp;

    }

    ngOnInit () {

    }

    onNewFile () {

        this.mainFileService.newFile();

    }

    onOpenFile () {

        this.mainFileService.showOpenWindow( this.mainFileService.fileService.projectFolder );

    }

    showNewRoadDialog () {

        this.dialog.open( NewRoadDialogComponent, {
            width: '680px',
            height: '680px',
            data: null,
            disableClose: true
        } );

    }

    onSave () {

        this.mainFileService.save();

    }

    onSaveAs () {

        this.mainFileService.saveAs();

    }


    onExit () {

        this.appService.exit();

    }

    onUndo () {

        CommandHistory.undo();

    }

    onRedo () {

        CommandHistory.redo();

    }

    openManual () {

        window.open( AppLinks.roadEditorManualLink, '_blank' );

    }

    openContactUs () {

        window.open( AppLinks.contactUsLink, '_blank' );

    }

    openUserGuide () {

        window.open( AppLinks.documentationLink, '_blank' );

    }

    importRecentFile ( file: IFile ) {

        this.mainFileService.openFromPath( file.path, null );

    }

    onImportOpenDRIVE () {

        this.odService.importOpenDrive();

    }

    onExportOpenDRIVE () {

        this.exporter.exportOpenDrive();

    }

    onExportGLTF () {

        this.exporter.exportGTLF();

    }

    onExportGLB () {

        // this.exporter.exportGLB();

        this.dialog.open( ExportGlbDialog, {
            width: '25vw',
        } );

    }

    importOdExample ( filename: string ) {

        if ( filename == null ) throw new Error( 'Invalid filename' );

        const filepath = `./assets/open-drive/${ filename }`;

        this.http.get( filepath, { responseType: 'text' } ).subscribe( response => {

            this.odService.importContent( response );

        } );
    }

    onExportCARLA () {

        this.exporter.exportCARLA();

    }

    logout () {

        this.appService.auth.logout();

        this.router.navigateByUrl( AppService.loginUrl );

    }

}
