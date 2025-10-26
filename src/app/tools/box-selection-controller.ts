/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ToolManager } from 'app/managers/tool-manager';
import { PointerModeService, PointerSelectionMode } from './pointer-mode.service';
import { BoxSelectionConfig, BoxSelectionService } from './box-selection-service';
import { Commands } from 'app/commands/commands';
import { SelectObjectCommand } from 'app/commands/select-object-command';
import { UnselectObjectCommand } from 'app/commands/unselect-object-command';

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

		const selection = [ ...this.activeSelection ];

		this.activeSelection = [];

		Commands.RemoveObject( selection );

		console.log( `BoxSelectionController: Deleted ${ selection.length } objects` );

		this.reset();

		return true;
	}

	isSessionActive (): boolean {
		return this.boxSelectionService.isActive();
	}

	private onSelectionUpdated ( selection: any[] ): void {

		// check which objects were unselected
		const unselectedObjects = this.activeSelection.filter( obj => !selection.includes( obj ) );

		// unselect them
		new UnselectObjectCommand( unselectedObjects ).execute();

		this.activeSelection = selection;

		if ( !this.pointerModeService.isBoxSelection() ) return;

		console.log( `BoxSelectionController: ${ selection.length } objects selected` );

		new SelectObjectCommand( this.activeSelection ).execute();

	}

	private onSelectionCompleted ( selection: any[] ): void {

		this.activeSelection = selection;

		console.log( `BoxSelectionController: Selection completed with ${ selection.length } objects` );

		new SelectObjectCommand( this.activeSelection ).execute();

	}

	private onSelectionCancelled (): void {

		new UnselectObjectCommand( this.activeSelection ).execute();

		this.activeSelection = [];

		this.activeConfig = undefined;

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

}
