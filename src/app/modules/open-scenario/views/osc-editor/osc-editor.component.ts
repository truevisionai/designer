import { AfterContentInit, AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { OscService } from '../../services/osc.service';
import { CommandHistory } from 'app/services/command-history';
import { ThreeService } from 'app/modules/three-js/three.service';
import { Object3D } from 'three';
import { OscEditor } from './osc-editor';
import { ElectronService } from 'ngx-electron';
import { OscSourceFile } from '../../services/osc-source-file';
import { OpenScenarioApiService } from '../../../../core/services/open-scenario-api.service';
import { KeyboardInput } from 'app/core/input';
import { MatDialog } from '@angular/material';
import { NewScenarioDialogComponent } from '../../dialogs/new-scenario-dialog/new-scenario-dialog.component';
import { ICommand } from '../../../../core/commands/i-command';

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
        private electron: ElectronService,
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
