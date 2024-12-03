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
import { CommandHistory } from '../../../commands/command-history';
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

	get production () {
		return Environment.production;
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

	ngOnInit (): void {

		const opacity = this.localStorage.get( 'models.opacity', 1 );
		this.mapService.setOpacityLevel( opacity );

	}

	onNewFile (): void {

		this.mainFileService.newScene();

	}

	async onOpenFile (): Promise<void> {

		await this.mainFileService.showOpenWindow( this.projectService.projectPath );

	}

	showNewRoadDialog (): void {


	}

	onSave (): void {

		this.mainFileService.save();

	}

	onSaveAs (): void {

		this.mainFileService.saveAs();

	}


	onExit (): void {

		this.appService.exit();

	}

	onUndo (): void {

		CommandHistory.undo();

	}

	onRedo (): void {

		CommandHistory.redo();

	}

	onEsminiSettings (): void {

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

	validateMap (): void {

		this.mapValidator.validateMap( this.mapService.map );

	}

	onMapSettings (): void {

		AppInspector.setDynamicInspector( new MapSeting( this.mapService, this.localStorage ) );

	}

	openManual (): void {

		window.open( AppLinks.roadEditorManualLink, '_blank' );

	}

	openContactUs (): void {

		window.open( AppLinks.contactUsLink, '_blank' );

	}

	openTutorials (): void {

		this.dialog.open( TutorialsDialogComponent, {
			width: '680px',
			height: '680px',
			data: null,
			disableClose: false
		} );

	}

	openUserGuide (): void {

		window.open( AppLinks.documentationLink, '_blank' );

	}

	onImportOpenDRIVE (): void {

		this.odService.showImportDialog();

	}

	onExportOpenDRIVE (): void {

		this.exporter.exportOpenDrive();

	}

	onExportGLTF (): void {

		this.exporter.exportGTLF();

	}

	onExportGLB (): void {

		// this.exporter.exportGLB();

		this.dialog.open( ExportGlbDialog, {
			width: '25vw',
		} );

	}

	importOdExample ( filename: string ): void {

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

	onExportCARLA (): void {

		this.exporter.exportCARLA();

	}

	openAbout (): void {

		alert( 'App Version ' + Environment.version );

	}

	logout (): void {

		this.appService.auth.logout();

		this.router.navigateByUrl( AppService.loginUrl );

	}

	exportOpenScenario (): void {

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
