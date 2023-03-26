/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ExporterService } from 'app/services/exporter.service';

@Component( {
	selector: 'app-export-glb-dialog',
	templateUrl: './export-glb-dialog.component.html'
} )
export class ExportGlbDialog implements OnInit {

	// popup window implementation
	// https://stackblitz.com/edit/angular-open-window-prxgi7?file=src%2Fapp%2Fapp.component.html

	filename: string = 'road.glb';

	forcePowerOfTwoTextures: boolean = true;

	constructor (
		private dialogRef: MatDialogRef<ExportGlbDialog>,
		private exporter: ExporterService,
	) {
	}

	ngOnInit () {

		// this.exporter.exportGLB();

	}

	export () {

		this.exporter.exportGLB( this.filename );

		this.dialogRef.close();

	}


}
