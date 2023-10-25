/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportFbxDialogComponent } from 'app/views/dialogs/import-fbx-dialog/import-fbx-dialog.component';
import {
	ImportOpenScenarioDialogComponent,
	ImportOpenScenarioDialogData
} from '../modules/scenario/dialogs/import-open-scenario-dialog/import-open-scenario-dialog.component';


@Injectable( {
	providedIn: 'root'
} )
export class DialogFactory {

	private static dialog: MatDialog;

	constructor ( dialog: MatDialog ) {
		DialogFactory.dialog = dialog;
	}

	static showImportOpenScenarioDialog ( path: string, destinationPath: string, extension: string ) {

		return this.dialog.open( ImportOpenScenarioDialogComponent, {
			width: '680px',
			height: '680px',
			data: new ImportOpenScenarioDialogData( path, destinationPath, extension ),
		} );

	}

	static showImportFBXDialog ( path: string, destinationPath: string, extension: string ) {

		return this.dialog.open( ImportFbxDialogComponent, {
			width: '680px',
			height: '680px',
			data: { path, destinationPath, extension }
		} );

	}

}
