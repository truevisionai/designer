/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SearchPipe } from 'app/core/pipes/search.pipe';
import { Debug } from 'app/core/utils/debug';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { BuilderService } from '../../builders/tv-builder.service';
import { AddEntityCommand } from '../../commands/tv-add-entity-command';
import { PositionAction } from '../../models/actions/tv-position-action';
import { CatalogReference } from '../../models/tv-catalogs';
import { EntityObject } from '../../models/tv-entities';
import { CatalogReferenceController } from '../../models/tv-interfaces';
import { WorldPosition } from '../../models/positions/tv-world-position';
import { DriverService } from '../../services/tv-driver.service';
import { ModelsService } from '../../services/tv-models.service';

export class AddVehicleDialogData {
	name: string = 'Vehicle';
	driver: string = 'DefaultDriver';
	model: string = 'vehicle_1';
}

@Component( {
	selector: 'app-add-vehicle-dialog',
	templateUrl: './add-vehicle-dialog.component.html',
	providers: [ SearchPipe ]
} )
export class AddVehicleDialogComponent implements OnInit {

	query: string;
	public vehicle = new AddVehicleDialogData;

	constructor (
		public dialogRef: MatDialogRef<AddVehicleDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: AddVehicleDialogData,
		public modelService: ModelsService,
		public driverService: DriverService,
		private oscBuilder: BuilderService,
		private searchPipe: SearchPipe
	) {
	}

	get models () {
		return this.modelService.vehicleModels;
	}

	get drivers () {
		return this.driverService.vehicleDrivers;
	}

	get defaultName () {
		return 'Vehicle';
	}

	ngOnInit () {

		Debug.log( 'init', this.data );

	}

	onModelChanged ( $event ) {

		Debug.log( $event );

	}

	onCancel (): void {

		this.dialogRef.close();

	}

	onAdd (): void {

		this.dialogRef.close();

	}

	createEntity ( name: string, model: string, driver: string ): EntityObject {

		const object = new EntityObject( name );

		object.catalogReference = new CatalogReference( 'VehicleCatalog', model );

		object.controller = new CatalogReferenceController( new CatalogReference( 'DriverCatalog', driver ) );

		const worldPosition = new WorldPosition( 0, 0, 0 );

		const positionAction = new PositionAction( worldPosition );

		object.initActions.push( positionAction );

		return object;
	}

	addEntity ( entity: EntityObject ) {

		CommandHistory.execute( new AddEntityCommand( entity ) );

		BuilderService.buildVehicleEntity( entity );

	}

	@HostListener( 'document:keydown.enter', [ '$event' ] )
	onKeydownHandler ( event: KeyboardEvent ) {

		const results = this.searchPipe.transform( this.models, this.query );

		if ( results.length > 0 ) {

			const model = results[ 0 ];

			this.onModelClicked( model );

		} else {

			SnackBar.show( 'No object selected' );

		}

	}

	onModelClicked ( model: string ) {

		const entity = this.createEntity( model, model, 'DefaultDriver' );

		this.addEntity( entity );

		this.dialogRef.close();

	}
}
