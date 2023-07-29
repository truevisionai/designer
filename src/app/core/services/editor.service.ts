/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MainFileService } from 'app/services/main-file.service';
import { KeyboardInput } from '../input';
import { ShortcutService } from './shortcut.service';

@Injectable( {
	providedIn: 'root'
} )
export class EditorService {

	constructor (
		private shortcutService: ShortcutService,
		private mainFileService: MainFileService,
		public settings: EditorSettings
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
		KeyboardInput.OnKeyDown( e );

		// handle shortcuts
		ShortcutService.handleKeyDown( e );

	}

	onKeyUp ( e: KeyboardEvent ) {

		// fire the event for the whole application
		KeyboardInput.OnKeyUp( e );

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class EditorSettings {

	constructor () { }

	get esminiPath (): string {
		return localStorage.getItem( 'esminiPath' );
	}

	set esminiPath ( value ) {
		localStorage.setItem( 'esminiPath', value );
	}

}


