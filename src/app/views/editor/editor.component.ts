/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterContentInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EditorService } from 'app/core/services/editor.service';
import { TvConsole } from 'app/core/utils/console';
import { ScenarioDirectorService } from 'app/modules/scenario/services/scenario-director.service';
import { MainFileService } from 'app/services/main-file.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { NewRoadDialogComponent } from '../../modules/tv-map/dialogs/new-road-dialog/new-road-dialog.component';

@Component( {
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: [ './editor.component.css' ],
} )
export class EditorComponent implements OnInit, AfterContentInit {

	consoleLabel = 'Console';

	constructor (
		private dialog: MatDialog,
		private analytics: AnalyticsService,
		private mainFileService: MainFileService,
		private editor: EditorService,
		private oscPlayer: ScenarioDirectorService,
		private changeDetectorRef: ChangeDetectorRef,
	) {

		TvConsole.logsChanged.subscribe( () => this.onLogsChanged() );

	}

	get scenario () {

		return this.mainFileService.scenario;

	}

	onLogsChanged (): void {

		this.consoleLabel = `Console (${ TvConsole.logs.length })`;

		this.changeDetectorRef.detectChanges();

	}

	ngOnInit () {

		this.mainFileService.newScene();

	}

	ngAfterContentInit (): void {

		// setTimeout( () => {

		//     this.showNewScenarioDialog();

		// }, 300 );

	}

	showNewScenarioDialog () {

		this.dialog.open( NewRoadDialogComponent, {
			width: '680px',
			height: '680px',
			data: null,
			disableClose: true
		} );

	}

	@HostListener( 'document:keydown', [ '$event' ] )
	onKeyDown ( e: KeyboardEvent ) {

		this.editor.onKeyDown( e );

	}

	@HostListener( 'document:keyup', [ '$event' ] )
	onKeyUp ( e: KeyboardEvent ) {

		this.editor.onKeyUp( e );

	}

}
