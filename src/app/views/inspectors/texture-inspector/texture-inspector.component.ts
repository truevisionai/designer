/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Texture } from 'three';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/models/metadata.model';
import { AssetDatabase } from 'app/services/asset-database';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';

@Component( {
    selector: 'app-texture-inspector',
    templateUrl: './texture-inspector.component.html',
    styleUrls: [ './texture-inspector.component.css' ]
} )
export class TextureInspector implements OnInit, IComponent, OnDestroy {

    // @Input() texture: Texture;

    public data: {
        texture: Texture,
        guid: string
    };

    public metadata: Metadata;

    get texture (): Texture { return this.data.texture; }

    constructor () { }

    ngOnInit () {

        this.metadata = AssetDatabase.getMetadata( this.data.guid );

        console.log( this.data );
        // console.log( this.texture );
        // console.log( this.texture.image );

    }

    ngOnDestroy () {

        if ( this.texture ) {

            // TODO: fix file saving
            MetadataFactory.createTextureMetadata( this.metadata.guid, this.metadata.path, this.texture );

        }
    }

    onChange ( $event ) {

        this.texture.needsUpdate = true;

    }


}
