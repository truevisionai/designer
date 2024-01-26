/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { EsminiPlayerService } from 'app/services/esmini-player.service';
import { IComponent } from 'app/objects/game-object';

@Component( {
	selector: 'app-esmini-inspector',
	templateUrl: './esmini-inspector.component.html',
	styleUrls: [ './esmini-inspector.component.scss' ]
} )
export class EsminiInspectorComponent extends BaseInspector implements IComponent {

	data: string[] = [];
	isOpen = true;

	constructor (
		private esminiPlayer: EsminiPlayerService
	) {
		super();
	}

	ngOnInit () {
	}
}
