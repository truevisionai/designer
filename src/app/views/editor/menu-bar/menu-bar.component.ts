/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { IFile } from 'app/io/file';
import { EditorService } from 'app/services/editor.service';
import { Environment } from 'app/core/utils/environment';
import { OpenDriveExporter } from 'app/modules/tv-map/services/open-drive-exporter';
import { ExporterService } from 'app/services/exporter.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { RecentFileService } from 'app/services/recent-file.service';
import { RoadExporterService } from 'app/exporters/road-style-exporter.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { AppInputDialogService } from 'app/views/shared/dialogs/app-input-dialog/app-input-dialog-service';

import { AppService } from '../../../services/app.service';
import { TvMapService } from '../../../modules/tv-map/services/tv-map.service';
import { AppLinks } from '../../../services/app-links';
import { CommandHistory } from '../../../services/command-history';
import { ExportGlbDialog } from '../dialogs/export-glb-dialog/export-glb-dialog.component';
import { TutorialsDialogComponent } from '../dialogs/tutorials-dialog/tutorials-dialog.component';


@Component( {
	selector: 'app-menu-bar',
	templateUrl: './menu-bar.component.html',
	styleUrls: [ './menu-bar.component.css' ]
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
		private mainFileService: TvSceneFileService,
		private openDriveExporter: OpenDriveExporter,
		private roadStyleExporter: RoadExporterService,
		private inputDialogService: AppInputDialogService,
		private editorService: EditorService
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

		this.mainFileService.newScene();

	}

	onOpenFile () {

		this.mainFileService.showOpenWindow( this.mainFileService.fileService.projectFolder );

	}

	showNewRoadDialog () {


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

	onEsminiSettings () {

		const settings = {
			title: 'Esmini Settings',
			fields: [
				{
					name: 'Esmini Enabled',
					key: 'esminiEnabled',
					type: 'checkbox',
					value: this.editorService.settings.esminiEnabled
				},
				{
					name: 'Esmini Path',
					key: 'esminiPath',
					type: 'text',
					value: this.editorService.settings.esminiPath
				},
				{
					name: 'OdrViewer Path',
					key: 'odrViewerPath',
					type: 'text',
					value: this.editorService.settings.odrViewerPath
				}
			]
		};

		this.inputDialogService.open( settings.title, settings.fields ).subscribe( result => {
			if ( result ) {
				this.editorService.settings.esminiEnabled = result.esminiEnabled;
				this.editorService.settings.esminiPath = result.esminiPath;
				this.editorService.settings.odrViewerPath = result.odrViewerPath;
			}
		} );

	}

	openManual () {

		window.open( AppLinks.roadEditorManualLink, '_blank' );

	}

	openContactUs () {

		window.open( AppLinks.contactUsLink, '_blank' );

	}

	openTutorials () {

		this.dialog.open( TutorialsDialogComponent, {
			width: '680px',
			height: '680px',
			data: null,
			disableClose: false
		} );

	}

	openUserGuide () {

		window.open( AppLinks.documentationLink, '_blank' );

	}

	importRecentFile ( file: IFile ) {

		this.mainFileService.openFromPath( file.path, null );

	}

	onImportOpenDRIVE () {

		this.odService.showImportDialog();

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

		this.http.get( filepath, { responseType: 'text' } ).subscribe( contents => {

			const map = this.odService.parse( contents );

			if ( map == null ) return;

			this.mainFileService.newScene( map );

		} );
	}

	onExportCARLA () {

		this.exporter.exportCARLA();

	}

	openAbout () {

		alert( 'App Version ' + Environment.version );

	}

	logout () {

		this.appService.auth.logout();

		this.router.navigateByUrl( AppService.loginUrl );

	}

	exportOpenScenario () {

		this.exporter.exportOpenScenario();

	}
}
