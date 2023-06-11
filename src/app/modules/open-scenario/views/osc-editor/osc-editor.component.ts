import { AfterContentInit, AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KeyboardInput } from 'app/core/input';
import { ThreeService } from 'app/modules/three-js/three.service';
import { CommandHistory } from 'app/services/command-history';
import { TvElectronService } from 'app/services/tv-electron.service';
import { Object3D } from 'three';
import { ICommand } from '../../../../core/commands/i-command';
import { OpenScenarioApiService } from '../../../../core/services/open-scenario-api.service';
import { NewScenarioDialogComponent } from '../../dialogs/new-scenario-dialog/new-scenario-dialog.component';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscService } from '../../services/osc.service';
import { OscEditor } from './osc-editor';

@Component( {
	selector: 'app-osc-editor',
	templateUrl: './osc-editor.component.html'
} )
export class OscEditorComponent implements OnInit, AfterViewInit, AfterContentInit {

	private static threeService: ThreeService;
	private isOpeningFromUrl = false;

	constructor (
		private route: ActivatedRoute,
		private oscService: OscService,
		private threeService: ThreeService,
		private electron: TvElectronService,
		private openScenarioApi: OpenScenarioApiService,
		private dialog: MatDialog
	) {
		OscEditor.threeService = threeService;
	}

	get scenario () {
		return OscSourceFile.openScenario;
	}

	static execute ( command: ICommand ) {
		CommandHistory.execute( command );
	}

	static focus ( obj: Object3D ) {
		this.threeService.focus( obj );
	}

	ngOnInit () {

		this.openFileFromUrl();

	}

	ngAfterViewInit (): void {

		// this.showNewScenarioDialog();

	}

	ngAfterContentInit (): void {

		if ( this.isOpeningFromUrl ) return;

		setTimeout( () => {

			this.showNewScenarioDialog();

		}, 300 );

	}

	openFileFromUrl () {

		this.route.queryParamMap.subscribe( params => {

			this.importFromUrlFilepath( params );

			this.checkForScenarioNameInUrl( params );

		} );
	}

	showNewScenarioDialog () {

		this.dialog.open( NewScenarioDialogComponent, {
			width: '480px',
			height: '320px',
			data: null,
			disableClose: true
		} );

	}

	checkForScenarioNameInUrl ( params: ParamMap ): any {

		const scenarioName = params.get( 'scenario_name' );

		if ( scenarioName != null ) {

			this.openScenarioApi.getOpenScenario( scenarioName ).subscribe( file => {

				this.isOpeningFromUrl = true;

				this.oscService.import( file );

			} );
		}

	}

	importFromUrlFilepath ( params: ParamMap ): any {

		if ( this.electron.isElectronApp ) {

			const filepath = params.get( 'filepath' );

			if ( filepath != null && filepath !== '' && filepath !== 'null' ) {

				this.isOpeningFromUrl = true;

				this.oscService.importFromPath( filepath );
			}

		}

	}

	@HostListener( 'document:keydown', [ '$event' ] )
	onKeyDown ( e: KeyboardEvent ) {

		KeyboardInput.OnKeyDown( e );

	}

	@HostListener( 'document:keyup', [ '$event' ] )
	onKeyUp ( e: KeyboardEvent ) {

		KeyboardInput.OnKeyUp( e );

	}

}
