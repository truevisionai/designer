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
		private mainFileService: MainFileService
	) {
	}

	newFile () {

		this.mainFileService.newFile();

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
