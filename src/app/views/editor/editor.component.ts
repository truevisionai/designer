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
import { ToolManager } from "../../managers/tool-manager";
import { ToolType } from "../../tools/tool-types.enum";
import { QuesionsDialogComponent } from '../sessions/questions/questions-dialog.component';
import { ProfileService } from 'app/services/profile.service';

@Component( {
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: [ './editor.component.css' ],
} )
export class EditorComponent implements OnInit, AfterContentInit {

	consoleLabel = 'Console';

	get isProduction (): boolean {
		return true; // Environment.production
	}

	get heirarchyWidth (): number {
		return this.isProduction ? 0 : 16;
	}

	get viewportWidth (): number {
		return this.isProduction ? 76 : 60;
	}

	get inspectorHeight (): number {

		if ( this.isElevationToolOpened ) {
			return 70;
		}

		return 100
	}

	get graphHeight (): number {

		if ( this.isElevationToolOpened ) {
			return 30;
		}

		return 0
	}

	get isElevationToolOpened (): boolean {
		return ToolManager.currentTool?.toolType == ToolType.RoadElevation;
	}

	constructor (
		private dialog: MatDialog,
		private analytics: AnalyticsService,
		private mainFileService: TvSceneFileService,
		private editor: EditorService,
		private oscPlayer: ScenarioDirectorService,
		private changeDetectorRef: ChangeDetectorRef,
		private shortcutService: ShortcutService,
		private profileService: ProfileService,
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

		this.openQuestionsDialog();
	}

	openQuestionsDialog () {

		this.profileService.fetchUser().subscribe( ( user ) => {

			if ( user.onboarding_completed == true ) return;

			this.dialog.open( QuesionsDialogComponent, {
				data: {},
				width: '40vw',
				closeOnNavigation: false,
				disableClose: true,
			} );

		}, ( error ) => {

			console.error( error );

		} );


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
