/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ExporterService } from 'app/services/exporter.service';
import { CoordinateSystem } from 'app/services/CoordinateSystem';

@Component( {
	selector: 'app-export-glb-dialog',
	templateUrl: './export-glb-dialog.component.html'
} )
export class ExportGlbDialog implements OnInit {

	// popup window implementation
	// https://stackblitz.com/edit/angular-open-window-prxgi7?file=src%2Fapp%2Fapp.component.html

	filename: string = 'road.glb';

	forcePowerOfTwoTextures: boolean = true;

	includeProps: boolean = true;

	coordinateSystem: string = 'y-up';

	constructor (
		private dialogRef: MatDialogRef<ExportGlbDialog>,
		private exporter: ExporterService,
	) {
	}

	ngOnInit () {

		// this.exporter.exportGLB();

	}

	export () {

		let coordinateSystem = CoordinateSystem.THREE_JS;

		if ( this.coordinateSystem === 'y-up' ) {
			coordinateSystem = CoordinateSystem.UNITY_GLTF;
		}

		this.exporter.exportGLB( this.filename, coordinateSystem );

		this.dialogRef.close();

	}


}
