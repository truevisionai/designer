/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { TvSignService } from 'app/modules/tv-map/services/tv-sign.service';
import { SearchPipe } from '../../../core/pipes/search.pipe';

@Component( {
    selector: 'app-prop-browser',
    templateUrl: './prop-browser.component.html',
    providers: [ SearchPipe ]
} )
/**
 * @deprecated dont need this prop browser as assets are placed in the project browser
 */
export class PropBrowserComponent implements OnInit {

    query: string;

    selectedName: string;

    constructor ( private searchPipe: SearchPipe, private signService: TvSignService ) {
    }

    get signs (): string[] {
        return this.signService.signs.map( value => {
            return value.name;
        } );
    }

    ngOnInit () {
    }

    onMouseDown ( name: string ): void {

        const sign = this.signService.signs.filter( value => {
            return value.name == name;
        } )[ 0 ];

        //
        // var texture = new TextureLoader().load( 'assets/signs/' + model + '.png' );
        // var material = new MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.9 } );
        // var geometry = new BoxGeometry( 1, 1, 1 );
        //
        // var sign = new Mesh( geometry, material );
        //
        // SceneService.add( sign );

        this.selectedName = name;

        this.signService.currentSign = {
            name: sign.name,
            shape: sign.shape
        };
    }

    onModelChanged ( $event: any ) {

    }
}
