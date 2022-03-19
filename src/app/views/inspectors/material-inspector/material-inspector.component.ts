/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/models/metadata.model';
import { PreviewService } from '../object-preview/object-preview.service';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { AssetFactory } from 'app/core/factories/asset-factory.service';
import { AssetDatabase } from 'app/services/asset-database';
import { Color } from 'three';

@Component( {
    selector: 'app-material-inspector',
    templateUrl: './material-inspector.component.html',
    styleUrls: [ './material-inspector.component.css' ]
} )
export class MaterialInspector implements OnInit, IComponent, OnDestroy {

    public data: {
        material: TvMaterial,
        guid: string
    };

    public metadata: Metadata;

    get thumbnail () { return this.metadata.preview; }

    get material () { return this.data.material; }

    get color (): any { return '#' + this.material.color.getHexString(); }

    set color ( value: any ) { this.material.color.setStyle( value ); this.updatePreviewCache(); }

    get emissive () { return '#' + this.material.emissive.getHexString(); }

    set emissive ( value ) { this.material.emissive.setStyle( value ); this.updatePreviewCache(); }

    constructor (
        private previewService: PreviewService,
    ) {
    }

    ngOnInit () {

        this.metadata = AssetDatabase.getMetadata( this.data.guid );

    }

    onNameChanged ( $name ) {

        this.material.name = $name;

    }

    onColorChanged ( $value: Color ) {

        this.material.color = $value;

        this.updatePreviewCache();
    }

    // not being used
    onEmissiveColorChanged ( $value: Color ) {

        this.material.emissive = $value;

        this.updatePreviewCache();
    }

    onRoughnessChanged ( $value ) {

        this.material.roughness = $value;

        this.updatePreviewCache();
    }

    onMetalnessChanged ( $value ) {

        this.material.metalness = $value;

        this.updatePreviewCache();
    }

    onMapChanged ( $guid: string, map: string ) {

        this.material[ `${ map }Guid` ] = $guid;
        this.material[ map ] = AssetDatabase.getInstance( $guid );
        this.material[ map ].needsUpdate = true;

        this.material.needsUpdate = true;

        this.updatePreviewCache();
    }


    ngOnDestroy () {

        AssetFactory.updateMaterial( this.metadata.path, this.material );

        this.updatePreviewCache();
    }

    updatePreviewCache () {

        this.metadata.preview = this.previewService.getMaterialPreview( this.material );

    }
}
