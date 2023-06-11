import { Component, OnInit } from '@angular/core';
import { OscService } from '../../services/osc.service';
import { OscDialogService } from '../../services/osc-dialog.service';
import { ImportFileDialogComponent } from 'app/shared/dialogs/import-file-dialog/import-file-dialog.component';
import { CommandHistory } from 'app/services/command-history';
import { TvElectronService } from 'app/services/tv-electron.service';

@Component( {
	selector: 'app-osc-menu-bar',
	templateUrl: './osc-menu-bar.component.html'
} )
export class OscMenuBarComponent implements OnInit {

	constructor (
		private oscService: OscService,
		private dialogService: OscDialogService,
		private electronService: TvElectronService,
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

		this.oscService.openFile();

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
