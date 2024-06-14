/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { EditorService } from 'app/services/editor/editor.service';
import { Environment } from 'app/core/utils/environment';
import { ExporterService } from 'app/services/exporter.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { AppInputDialogService } from 'app/views/shared/dialogs/app-input-dialog/app-input-dialog-service';

import { AppService } from '../../../services/app.service';
import { OpenDriveService } from '../../../map/services/open-drive.service';
import { AppLinks } from '../../../services/app-links';
import { CommandHistory } from '../../../services/command-history';
import { ExportGlbDialog } from '../dialogs/export-glb-dialog/export-glb-dialog.component';
import { TutorialsDialogComponent } from '../dialogs/tutorials-dialog/tutorials-dialog.component';
import { ProjectService } from 'app/services/editor/project.service';
import { MapService } from 'app/services/map/map.service';
import { AppInspector } from 'app/core/inspector';
import { SerializedField } from 'app/core/components/serialization';
import { LocalStorage } from 'app/services/local-storage';
import { MapValidatorService } from 'app/services/map/map-validator.service';


@Component( {
	selector: 'app-menu-bar',
	templateUrl: './menu-bar.component.html',
	styleUrls: [ './menu-bar.component.css' ]
} )
export class MenuBarComponent implements OnInit {

	get oscEnabled (): boolean {
		return Environment.oscEnabled;
	}

	get isElectronApp () {
		return this.electron.isElectronApp;
	}

	constructor (
		private appService: AppService,
		private odService: OpenDriveService,
		private electron: TvElectronService,
		private dialog: MatDialog,
		private http: HttpClient,
		private exporter: ExporterService,
		private router: Router,
		private mainFileService: TvSceneFileService,
		private inputDialogService: AppInputDialogService,
		private editorService: EditorService,
		private projectService: ProjectService,
		private mapService: MapService,
		private localStorage: LocalStorage,
		private mapValidator: MapValidatorService,
	) {
	}

	ngOnInit () {

		const opacity = this.localStorage.get( 'models.opacity', 1 );
		this.mapService.setOpacityLevel( opacity );

	}

	onNewFile () {

		this.mainFileService.newScene();

	}

	async onOpenFile () {

		await this.mainFileService.showOpenWindow( this.projectService.projectPath );

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

	validateMap () {

		this.mapValidator.validateMap( this.mapService.map );

	}

	onMapSettings () {

		AppInspector.setDynamicInspector( new MapSeting( this.mapService, this.localStorage ) );

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

		if ( filename == null ) {
			console.error( 'Invalid filename' );
			return;
		}

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

class MapSeting {

	constructor (
		private mapService: MapService,
		private localStorage: LocalStorage,
	) {
	}

	@SerializedField( { type: 'float' } )
	get opacity () {
		return this.mapService.getOpacityLevel();
	}

	set opacity ( value: number ) {
		this.mapService.setOpacityLevel( value );
		this.localStorage.store( 'models.opacity', value );
	}
}
