/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterContentInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EditorService } from 'app/services/editor/editor.service';
import { TvConsole } from 'app/core/utils/console';
import { ScenarioDirectorService } from 'app/scenario/services/scenario-director.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { ShortcutService } from 'app/services/editor/shortcut.service';

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
		private mainFileService: TvSceneFileService,
		private editor: EditorService,
		private oscPlayer: ScenarioDirectorService,
		private changeDetectorRef: ChangeDetectorRef,
		private shortcutService: ShortcutService
	) {

		TvConsole.logsChanged.subscribe( () => this.onLogsChanged() );

	}

	onLogsChanged (): void {

		this.consoleLabel = `Console (${ TvConsole.logs.length })`;

		this.changeDetectorRef.detectChanges();

	}

	ngOnInit () {

		this.mainFileService.newScene();
		this.shortcutService.init();

	}

	ngAfterContentInit (): void {

		// setTimeout( () => {

		//     this.showNewScenarioDialog();

		// }, 300 );

	}

	showNewScenarioDialog () {



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
