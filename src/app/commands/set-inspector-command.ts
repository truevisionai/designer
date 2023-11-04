/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { IComponent } from '../core/game-object';
import { AppInspector } from '../core/inspector';
import { BaseCommand } from './base-command';

export class SetInspectorCommand extends BaseCommand {

	private oldInspector: Type<IComponent>;
	private oldInspectorData: any;

	constructor ( public newInspector: Type<IComponent>, public newInspectorData: any ) {

		super();

		this.oldInspector = AppInspector.currentInspector;

		this.oldInspectorData = AppInspector.currentInspectorData;
	}

	execute (): void {

		AppInspector.setInspector( this.newInspector, this.newInspectorData );

	}

	undo (): void {

		AppInspector.setInspector( this.oldInspector, this.oldInspectorData );

	}

	redo (): void {

		this.execute();

	}
}
