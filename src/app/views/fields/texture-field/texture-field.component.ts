/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/services/asset-database';
import { Texture } from 'three';

@Component( {
    selector: 'app-texture-field',
    templateUrl: './texture-field.component.html',
    styleUrls: [ './texture-field.component.css' ]
} )
export class TextureFieldComponent implements OnInit {

    @Output() changed = new EventEmitter<string>();

    @Input() guid: string;

    @Input() label: string = 'Map';

    public texture: Texture;

    constructor () {
    }

    get thumbnail () {
        return this.texture && this.texture.image ? this.texture.image.currentSrc : '';
    }

    get filename () {
        return AssetDatabase.getAssetNameByGuid( this.guid );
    }

    get metadata () {
        return AssetDatabase.getMetadata( this.guid );
    }

    ngOnInit () {

        if ( this.guid ) this.texture = AssetDatabase.getInstance( this.guid );

    }

    @HostListener( 'click', [ '$event' ] )
    onClick ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

    }

    @HostListener( 'dblclick', [ '$event' ] )
    onDoubleClick ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

    }

    @HostListener( 'dragover', [ '$event' ] )
    onDragOver ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

    }

    @HostListener( 'dragleave', [ '$event' ] )
    onDragLeave ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

    }


    @HostListener( 'drop', [ '$event' ] )
    onDrop ( $event: DragEvent ) {

        $event.preventDefault();
        $event.stopPropagation();

        const guid = $event.dataTransfer.getData( 'guid' );

        if ( guid ) {

            const metadata = AssetDatabase.getMetadata( guid );

            if ( metadata.importer === 'TextureImporter' ) {

                this.texture = AssetDatabase.getInstance( guid );

                this.changed.emit( guid );

            }
        }
    }
}
