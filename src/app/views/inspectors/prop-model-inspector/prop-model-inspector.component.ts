/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropModel } from 'app/core/models/prop-model.model';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AssetDatabase } from 'app/services/asset-database';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { Object3D, Vector3 } from 'three';

@Component( {
	selector: 'app-prop-model-inspector',
	templateUrl: './prop-model-inspector.component.html'
} )
export class PropModelInspectorComponent implements OnInit, IComponent, OnDestroy {

	public data: DynamicMeta<PropModel>;

	public rotationVariance: Vector3;

	public scaleVariance: Vector3;

	public object: Object3D;

	constructor ( private assetService: AssetLoaderService ) {
	}

	get prop () {
		return this.data.data as PropModel;
	}

	ngOnInit () {

		// this.rotationVariance = new Vector3( this.prop.rotationVariance.x, this.prop.rotationVariance.y, this.prop.rotationVariance.z );

		// this.scaleVariance = new Vector3( this.prop.scaleVariance.x, this.prop.scaleVariance.y, this.prop.scaleVariance.z );

		this.object = AssetDatabase.getInstance( this.data.guid ) as Object3D;

		PropManager.setProp( this.data );
	}

	ngOnDestroy () {

		this.updateAssetFile();

	}

	updateAssetFile () {

		// AssetFactory.updatePropModelByGuid( this.data.guid, this.prop );

	}

	rotationChanged () {

		this.updateAssetFile();

		CommandHistory.execute( new SetValueCommand( this.prop, 'rotationVariance', this.rotationVariance ) );
	}

	scaleChanged () {

		this.updateAssetFile();

		CommandHistory.execute( new SetValueCommand( this.prop, 'scaleVariance', this.scaleVariance ) );
	}
}
