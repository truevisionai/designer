import { Component, OnInit } from '@angular/core';
import { OscService } from '../../services/osc.service';
import { OscDialogService } from '../../services/osc-dialog.service';
import { ElectronService } from 'ngx-electron';
import { ImportFileDialogComponent } from 'app/shared/dialogs/import-file-dialog/import-file-dialog.component';
import { MatDialog } from '@angular/material';
import { CommandHistory } from 'app/services/command-history';

@Component( {
    selector: 'app-osc-menu-bar',
    templateUrl: './osc-menu-bar.component.html'
} )
export class OscMenuBarComponent implements OnInit {

    constructor (
        private oscService: OscService,
        private dialogService: OscDialogService,
        private electronService: ElectronService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit () {

    }

    onNewFile () {

        this.oscService.newFile();

    }

    onSave () {

        this.oscService.save();

    }

    onSaveAs () {

        this.oscService.saveAs();


    }

    onOpenFile () {

        if ( this.electronService.isElectronApp ) {

            this.oscService.openFile();

        } else {

            const dialogRef = this.dialog.open( ImportFileDialogComponent, {
                width: '450px',
                data: null
            } );

            dialogRef.afterClosed().subscribe( ( response: string ) => {

                if ( response != null && response !== undefined ) {

                    this.oscService.importFromContent( response );

                }

            } );
        }
    }

    addVehicle () {

        this.dialogService.openAddVehicleDialog();

    }

    addPedestrian () {


    }

    onExit () {

    }


    undo () {

        CommandHistory.undo();

    }

    redo () {

        CommandHistory.redo();

    }

}
