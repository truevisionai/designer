import { Injectable } from '@angular/core';
import { StorageService } from 'app/io/storage.service';
import { ProjectService } from './project.service';

@Injectable( {
	providedIn: 'root',
} )
export class EditorSettings {

	private settings = {};

	constructor (
		private storageService: StorageService,
		private projectService: ProjectService
	) {
	}

	loadSettings () {

		try {

			const contents = this.storageService.readSync( this.projectService.settingsPath );

			this.settings = JSON.parse( contents );

		} catch ( error ) {

			console.error( error );

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

	private saveSettings () {

		const value = JSON.stringify( this.settings, null, 2 );

		try {

			this.storageService.writeSync( this.projectService.settingsPath, value );

		} catch ( error ) {

			console.error( error );

		}

	}

}
