import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { OscModelsService } from '../../services/osc-models.service';
import { OscDriverService } from '../../services/osc-driver.service';
import { OscEntityObject } from '../../models/osc-entities';
import { OscPositionAction } from '../../models/actions/osc-position-action';
import { OscWorldPosition } from '../../models/positions/osc-world-position';
import { OscBuilderService } from '../../builders/osc-builder.service';
import { OscAddEntityCommand } from '../../commands/osc-add-entity-command';
import { OscCatalogReference } from '../../models/osc-catalogs';
import { CatalogReferenceController } from '../../models/osc-interfaces';
import { CommandHistory } from 'app/services/command-history';
import { SearchPipe } from 'app/core/pipes/search.pipe';
import { SnackBar } from 'app/services/snack-bar.service';
import { Debug } from 'app/core/utils/debug';

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
        public modelService: OscModelsService,
        public driverService: OscDriverService,
        private oscBuilder: OscBuilderService,
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

    createEntity ( name: string, model: string, driver: string ): OscEntityObject {

        const object = new OscEntityObject( name );

        object.catalogReference = new OscCatalogReference( 'VehicleCatalog', model );

        object.controller = new CatalogReferenceController( new OscCatalogReference( 'DriverCatalog', driver ) );

        const worldPosition = new OscWorldPosition( 0, 0, 0 );

        const positionAction = new OscPositionAction( worldPosition );

        object.initActions.push( positionAction );

        return object;
    }

    addEntity ( entity: OscEntityObject ) {

        CommandHistory.execute( new OscAddEntityCommand( entity ) );

        OscBuilderService.buildVehicleEntity( entity );

    }

    @HostListener( 'document:keydown.enter', [ '$event' ] )
    onKeydownHandler ( event: KeyboardEvent ) {

        const results = this.searchPipe.transform( this.models, this.query );

        if ( results.length > 0 ) {

            const model = results[ 0 ];

            this.onModelClicked( model );

        } else {

            SnackBar.open( 'No object selected' );

        }

    }

    onModelClicked ( model: string ) {

        const entity = this.createEntity( model, model, 'DefaultDriver' );

        this.addEntity( entity );

        this.dialogRef.close();

    }
}
