/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { Vector3, Object3D } from 'three';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { DynamicMeta } from 'app/core/models/metadata.model';
import { CommandHistory } from 'app/services/command-history';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { PropModel } from 'app/core/models/prop-model.model';
import { AssetFactory } from 'app/core/factories/asset-factory.service';
import { AssetDatabase } from 'app/services/asset-database';
import { PropService } from 'app/services/prop-service';

@Component( {
    selector: 'app-prop-model-inspector',
    templateUrl: './prop-model-inspector.component.html'
} )
export class PropModelInspectorComponent implements OnInit, IComponent, OnDestroy {

    public data: DynamicMeta<PropModel>;

    public rotationVariance: Vector3;

    public scaleVariance: Vector3;

    public object: Object3D;

    get prop () { return this.data.data as PropModel; }

    constructor ( private assetService: AssetLoaderService ) { }

    ngOnInit () {

        // this.rotationVariance = new Vector3( this.prop.rotationVariance.x, this.prop.rotationVariance.y, this.prop.rotationVariance.z );

        // this.scaleVariance = new Vector3( this.prop.scaleVariance.x, this.prop.scaleVariance.y, this.prop.scaleVariance.z );

        this.object = AssetDatabase.getInstance( this.data.guid ) as Object3D;

        PropService.setProp( this.data );
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
