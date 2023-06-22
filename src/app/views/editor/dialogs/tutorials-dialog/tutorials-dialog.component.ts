import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppLinks } from 'app/services/app-links';
import { TvElectronService } from 'app/services/tv-electron.service';

@Component( {
	selector: 'app-tutorials-dialog',
	templateUrl: './tutorials-dialog.component.html',
	styleUrls: [ './tutorials-dialog.component.scss' ]
} )
export class TutorialsDialogComponent {

	constructor (
		private dialogRef: MatDialogRef<TutorialsDialogComponent>,
		private tvElectron: TvElectronService,
	) {
	}

	openYoutube () {

		this.tvElectron.openLink( AppLinks.tutorialsLink );

	}

}
