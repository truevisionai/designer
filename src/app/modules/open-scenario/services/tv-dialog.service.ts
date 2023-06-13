/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { AddEntityInitDialogComponent } from '../dialogs/add-entity-init-dialog/add-entity-init-dialog.component';
import { AddVehicleDialogComponent, AddVehicleDialogData } from '../dialogs/add-vehicle-dialog/add-vehicle-dialog.component';
import { ChooseActionDialogComponent, ChooseActionDialogData } from '../dialogs/choose-action-dialog/choose-action-dialog.component';
import { EditObjectInitDialog, EditObjectInitDialogData } from '../dialogs/edit-object-init-dialog/edit-object-init.dialog';
import { EditPositionDialogComponent, EditPositionDialogData } from '../dialogs/edit-position-dialog/edit-position-dialog.component';
import { EditRoadNetworkDialogComponent } from '../dialogs/edit-road-network-dialog/edit-road-network-dialog.component';
import { EditStoryDialog, EditStoryDialogData } from '../dialogs/edit-story-dialog/edit-story-dialog.component';
import { EntityObject } from '../models/tv-entities';
import { ActEditorComponent } from '../views/tv-act-editor/tv-act-editor.component';
import { TvScenarioInstance } from './tv-scenario-instance';

@Injectable( {
	providedIn: 'root'
} )
export class DialogService {

	// parse and show position actions
	// open dialog and pass the position
	// parse in input position and show html accordingly
	// edit position and show visual of position in map
	// submit the dialog and save position changes
	// apply/edit changes to the openScenario
	// send edit add command to openScenario
	//

	constructor ( public dialog: MatDialog ) {
	}

	get openScenario () {
		return TvScenarioInstance.openScenario;
	}

	openAddVehicleDialog (): any {

		const dialogRef = this.dialog.open( AddVehicleDialogComponent, {
			width: '840px',
			height: '640px',
			data: {
				name: 'Vehicle',
				driver: 'DefaultDriver',
				model: 'vehicle_1'
			}
		} );

		dialogRef.afterClosed().subscribe( ( result: AddVehicleDialogData ) => {

			Debug.log( 'add vehicle dialog was closed', result );

			// new EntityObject( result.name );

		} );

	}

	openAddEntityInitActionDialog ( entity: EntityObject ) {

		const dialogRef = this.dialog.open( AddEntityInitDialogComponent, {
			width: '250px',
			data: {
				entity: entity
			}
		} );

		dialogRef.afterClosed().subscribe( ( result: AddEntityInitDialogComponent ) => {

			Debug.log( 'add entity init dialog was closed', result );

		} );

	}

	openEditPositionDialog ( action: any ) {

		const dialogRef = this.dialog.open( EditPositionDialogComponent, {
			width: '250px',
			data: {
				action: action
			}
		} );

		dialogRef.afterClosed().subscribe( ( result: EditPositionDialogData ) => {

			Debug.log( 'edit position dialog was closed', result );

			// this.openScenario.addEntityInitAction( 'Ego', new PositionAction( new WorldPosition() ) )

		} );

	}

	openEditRoadNetworkDialog ( action: any ) {

		const dialogRef = this.dialog.open( EditRoadNetworkDialogComponent, {
			width: '350px',
			data: {
				action: action
			}
		} );

		dialogRef.afterClosed().subscribe( ( result: any ) => {

			Debug.log( 'dialog-closed', result );

		} );

	}

	openObjectInitEditorDialog ( entity: EntityObject ) {

		const data = new EditObjectInitDialogData( entity );

		const dialogRef = this.dialog.open( EditObjectInitDialog, {
			width: '640px',
			height: '480px',
			data: data
		} );

		dialogRef.afterClosed().subscribe( ( result: any ) => {

			Debug.log( 'dialog-closed', result );

		} );

	}

	openStoryEditorDialog ( entity: EntityObject ) {

		const data = new EditStoryDialogData( entity );

		const dialogRef = this.dialog.open( EditStoryDialog, {
			width: '960px',
			height: '600px',
			data: data
		} );

		dialogRef.afterClosed().subscribe( ( result: any ) => {

			Debug.log( 'dialog-closed', result );

		} );

	}

	openChooseActionDialog ( callbackFn: ( data: ChooseActionDialogData ) => void = null ) {

		const data = new ChooseActionDialogData();

		const dialogRef = this.dialog.open( ChooseActionDialogComponent, {
			width: '360px',
			height: '600px',
			data: data
		} );

		dialogRef.afterClosed().subscribe( ( response: ChooseActionDialogData ) => {

			if ( callbackFn != null ) callbackFn( response );

		} );

	}

	openEditActDialog ( entity: EntityObject, callbackFn: Function = null ) {

		const dialogRef = this.dialog.open( ActEditorComponent, {
			width: '860px',
			height: '600px',
			data: entity
		} );

		dialogRef.afterClosed().subscribe( ( response: any ) => {

			if ( callbackFn != null ) callbackFn( response );

		} );

	}


}
