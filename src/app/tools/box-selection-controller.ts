/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/commands/command-history';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { ToolManager } from 'app/managers/tool-manager';
import { StatusBarService } from 'app/services/status-bar.service';
import { PointerModeService, PointerSelectionMode } from './pointer-mode.service';
import { BoxSelectionConfig, BoxSelectionService } from './box-selection-service';

@Injectable( {
	providedIn: 'root'
} )
export class BoxSelectionController {

	private activeSelection: any[] = [];
	private activeConfig?: BoxSelectionConfig<any>;

	constructor (
		private readonly boxSelectionService: BoxSelectionService,
		private readonly pointerModeService: PointerModeService,
	) {

		this.boxSelectionService.selectionUpdated$.subscribe( selection => this.onSelectionUpdated( selection ) );
		this.boxSelectionService.selectionCompleted$.subscribe( selection => this.onSelectionCompleted( selection ) );
		this.boxSelectionService.selectionCancelled$.subscribe( () => this.onSelectionCancelled() );

		this.pointerModeService.modeChanges.subscribe( mode => {
			if ( mode !== PointerSelectionMode.BoxSelection ) {
				this.reset();
			}
		} );

		ToolManager.toolChanged.subscribe( () => this.reset() );

	}

	beginSession ( event: PointerEventData, config: BoxSelectionConfig<any> ): void {

		this.activeConfig = config;

		this.boxSelectionService.beginSession( event, config );

	}

	start ( event: PointerEventData ): void {

		return this.boxSelectionService.start( event );

	}

	update ( event: PointerEventData ): any[] {

		return this.boxSelectionService.update( event );

	}

	end ( event: PointerEventData ): any[] {

		return this.boxSelectionService.end( event );

	}

	clear (): void {

		this.boxSelectionService.clearSelection();

	}

	handleDeleteRequest (): boolean {

		if ( this.activeSelection.length === 0 ) return false;

		if ( this.activeConfig?.allowBatchDelete !== true ) return false;

		const commands = this.activeSelection.map( object => new RemoveObjectCommand( object, true ) );

		if ( commands.length === 0 ) return false;

		CommandHistory.executeMany( ...commands );

		StatusBarService.setHint( `${ commands.length } ${ this.getLabel( commands.length ) } deleted` );

		this.reset();

		return true;
	}

	isSessionActive (): boolean {
		return this.boxSelectionService.isActive();
	}

	private onSelectionUpdated ( selection: any[] ): void {

		this.activeSelection = selection;

		if ( !this.pointerModeService.isBoxSelection() ) return;

		if ( selection.length === 0 ) {

			StatusBarService.clearHint();

			return;
		}

		StatusBarService.setHint( `${ selection.length } ${ this.getLabel( selection.length ) } selected` );

	}

	private onSelectionCompleted ( selection: any[] ): void {

		this.activeSelection = selection;

		if ( selection.length === 0 ) {
			StatusBarService.setHint( 'No selectable objects found in region' );
		}

	}

	private onSelectionCancelled (): void {

		this.activeSelection = [];
		this.activeConfig = undefined;

		StatusBarService.clearHint();

	}

	private reset (): void {

		if ( this.boxSelectionService.isActive() ) {
			this.boxSelectionService.cancel();
		} else {
			this.boxSelectionService.clearSelection();
		}

		this.activeSelection = [];
		this.activeConfig = undefined;

	}

	private getLabel ( count: number ): string {

		const label = this.activeConfig?.label || 'object';

		if ( count === 1 ) return label;

		return label.endsWith( 's' ) ? label : `${ label }s`;

	}

}
