/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { FrontSide, MeshBasicMaterial } from 'three';
import { ICommandCallback } from '../../../core/commands/i-command';
import { RemoveLaneCommand } from '../../../core/commands/remove-lane-command';
import { SetLanePropertyCommand } from '../../../core/commands/set-lane-property-command';
import { BaseInspector } from '../../../core/components/base-inspector.component';
import { IComponent } from '../../../core/game-object';
import { OdTextures } from '../../../modules/tv-map/builders/od.textures';
import { TvLaneType } from '../../../modules/tv-map/models/tv-common';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { CommandHistory } from '../../../services/command-history';
import { COLOR } from '../../../shared/utils/colors.service';

@Component( {
	selector: 'app-lane-type-inspector',
	templateUrl: './lane-inspector.component.html',
} )
export class LaneInspectorComponent extends BaseInspector implements IComponent, ICommandCallback {

	data: TvLane;

	get types () {
		return TvLaneType;
	}

	get lane (): TvLane {
		return this.data;
	}

	onChange ( $event: MatSelectChange ) {

		this.rebuild();

	}

	onDelete () {

		if ( !this.lane ) return;

		CommandHistory.execute( new RemoveLaneCommand( this.lane ) );

	}

	onTypeChanged ( $event: MatSelectChange ) {

		const cmd = new SetLanePropertyCommand( this.lane, 'type', $event.value );

		cmd.callbacks = this;

		CommandHistory.execute( cmd );

	}

	onExecute (): void {

		this.rebuild();

	}

	onUndo (): void {

		this.rebuild();

	}

	onRedo (): void {

		this.rebuild();

	}

	rebuild () {

		const material = new MeshBasicMaterial( {
			map: OdTextures.getLaneTexture( this.lane ),
			color: COLOR.WHITE,
			wireframe: false,
			side: FrontSide
		} );

		this.lane.gameObject.material = null;
		this.lane.gameObject.material = material;
	}
}
