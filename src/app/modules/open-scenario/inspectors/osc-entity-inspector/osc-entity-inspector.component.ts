/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from '../../../../core/inspector';
import { OscEntityObject } from '../../models/osc-entities';
import { OscDialogService } from '../../services/osc-dialog.service';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscActionsInspectorComponent } from '../osc-actions-inspector/osc-player-actions-inspector.component';

@Component( {
	selector: 'app-osc-player-inspector',
	templateUrl: './osc-entity-inspector.component.html',
	styleUrls: [ './osc-entity-inspector.component.css' ]
} )
export class EntityInspector implements OnInit, IComponent {

	data: OscEntityObject;

	// @Input() entity: OscEntityObject;

	constructor ( public dialog: MatDialog, private dialogService: OscDialogService ) {
	}

	get entity () {
		return this.data;
	}

	get initActions () {
		return this.entity.initActions;
	}

	get absolutePosition () {
		return this.entity.gameObject.position;
	};

	get scenario () {
		return OscSourceFile.openScenario;
	}

	ngOnInit () {

	}

	addInitActions () {

		this.dialogService.openAddEntityInitActionDialog( this.entity );

	}

	editPositionAction ( action ) {

		this.dialogService.openEditPositionDialog( action );

	}

	editStory () {

		this.dialogService.openStoryEditorDialog( this.entity );

	}

	editInitActions () {

		this.dialogService.openObjectInitEditorDialog( this.entity );

	}

	editActions () {

		// let actions = this.scenario.getActionsByEntity( this.entity.name );

		// Debug.log( actions );

		AppInspector.setInspector( OscActionsInspectorComponent, this.entity );

	}

	editAct () {

		this.dialogService.openEditActDialog( this.entity );

	}
}
