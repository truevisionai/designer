import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
	ImportOpenScenarioDialogComponent,
	ImportOpenScenarioDialogData
} from '../../modules/scenario/dialogs/import-open-scenario-dialog/import-open-scenario-dialog.component';


@Injectable( {
	providedIn: 'root'
} )
export class DialogFactory {

	private static dialog: MatDialog;

	constructor ( dialog: MatDialog ) {
		DialogFactory.dialog = dialog;
	}

	static showImportOpenScenarioDialog ( path: string, destinationPath: string, extension: string ) {

		this.dialog.open( ImportOpenScenarioDialogComponent, {
			width: '680px',
			height: '680px',
			data: new ImportOpenScenarioDialogData( path, destinationPath, extension ),
		} );

	}

}
