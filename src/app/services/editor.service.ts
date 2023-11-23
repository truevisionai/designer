/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileService } from 'app/io/file.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { KeyboardEvents } from '../events/keyboard-events';
import { TvMapService } from "../modules/tv-map/services/tv-map.service";
import { MapService } from "./map.service";
import { ScenarioService } from "../modules/scenario/services/scenario.service";

@Injectable( {
	providedIn: 'root'
} )
export class EditorService {

	get map () {
		return this.mapService.map;
	}

	get scenario () {
		return ScenarioService.scenario;
	}

	constructor (
		private mainFileService: TvSceneFileService,
		public settings: EditorSettings,
		private mapService: MapService,
		private scenarioService: ScenarioService,
	) {
	}

	newFile () {

		this.mainFileService.newScene();

	}

	save () {

		this.mainFileService.save();

	}

	saveAs () {

		this.mainFileService.saveAs();

	}

	onKeyDown ( e: KeyboardEvent ) {

		// fire the event for the whole application
		KeyboardEvents.OnKeyDown( e );

	}

	onKeyUp ( e: KeyboardEvent ) {

		// fire the event for the whole application
		KeyboardEvents.OnKeyUp( e );

	}

}

@Injectable( {
	providedIn: 'root',
} )
export class EditorSettings {

	private settingsPath: string;

	private settings = {};

	constructor ( private fileService: FileService ) {

		const projectFolder = this.fileService.projectFolder;

		try {

			this.settingsPath = fileService.join( projectFolder, 'settings.json' );

			this.loadSettings();

		} catch ( error ) {

			console.log( error );

		}
	}

	get esminiEnabled (): boolean {
		return this.settings[ 'esminiEnabled' ] == 'true' || this.settings[ 'esminiEnabled' ] == true;
	}

	set esminiEnabled ( value: boolean ) {
		this.setSetting( 'esminiEnabled', value );
	}

	get esminiPath (): string {
		return this.settings[ 'esminiPath' ];
	}

	set esminiPath ( value: string ) {
		this.setSetting( 'esminiPath', value );
	}

	get odrViewerPath (): string {
		return this.settings[ 'odrViewerPath' ];
	}

	set odrViewerPath ( value: string ) {
		this.setSetting( 'odrViewerPath', value );
	}

	getSetting ( key: string ): any {
		return this.settings[ key ];
	}

	setSetting ( key: string, value: any ) {
		this.settings[ key ] = value;
		this.saveSettings();
	}

	private loadSettings () {

		if ( this.fileService.fs.existsSync( this.settingsPath ) ) {

			this.settings = JSON.parse( this.fileService.fs.readFileSync( this.settingsPath, 'utf-8' ) );

		} else {

			this.settings = {};

			this.saveSettings();

		}

	}

	private saveSettings () {

		const value = JSON.stringify( this.settings, null, 2 );

		try {

			this.fileService.fs.writeFileSync( this.settingsPath, value, 'utf-8' );

		} catch ( error ) {

			console.error( error );

		}

	}

}



