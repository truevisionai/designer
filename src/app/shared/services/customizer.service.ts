/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from './layout.service';

@Injectable( {
    providedIn: 'root'
} )
export class CustomizerService {


    colors = [
        {
            class: 'black',
            active: false
        },
        {
            class: 'white',
            active: false
        },
        {
            class: 'slate-gray',
            active: false
        },
        {
            class: 'dark-gray',
            active: false
        },
        {
            class: 'gray',
            active: false
        },
        {
            class: 'dark-purple',
            active: false
        },
        {
            class: 'blue',
            active: false
        },
        {
            class: 'dark-blue',
            active: false
        },
        {
            class: 'indigo',
            active: false
        },
        {
            class: 'yellow',
            active: false
        },
        {
            class: 'green',
            active: false
        },
        {
            class: 'pink',
            active: false
        },
        {
            class: 'red',
            active: false
        }
    ];
    selectedSidebarColor;
    topbarColors: any[];
    sidebarColors: any[];

    constructor (
        private router: Router,
        private layout: LayoutService,
    ) {
        this.topbarColors = this.getTopbarColors();
        this.sidebarColors = this.getSidebarColors();
    }

    getSidebarColors () {
        let sidebarColors = [ 'black', 'white', 'dark-gray', 'dark-purple', 'dark-blue', ];
        return this.colors.filter( color => {
            return sidebarColors.includes( color.class );
        } )
            .map( c => {
                c.active = c.class === this.layout.layoutConf.sidebarColor;
                return { ...c };
            } );

    }

    getTopbarColors () {
        let topbarColors = [ 'black', 'white', 'dark-gray', 'dark-purple', 'dark-blue', 'indigo', 'pink', 'red', 'yellow', 'green' ];
        return this.colors.filter( color => {
            return topbarColors.includes( color.class );
        } )
            .map( c => {
                c.active = c.class === this.layout.layoutConf.topbarColor;
                return { ...c };
            } );
    }

    changeSidebarColor ( color ) {
        this.layout.publishLayoutChange( { sidebarColor: color.class } );
        this.sidebarColors = this.getSidebarColors();
    }

    changeTopbarColor ( color ) {
        this.layout.publishLayoutChange( { topbarColor: color.class } );
        this.topbarColors = this.getTopbarColors();
    }

    removeClass ( el, className ) {
        if ( !el || el.length === 0 ) return;
        if ( !el.length ) {
            el.classList.remove( className );
        } else {
            for ( var i = 0; i < el.length; i++ ) {
                el[ i ].classList.remove( className );
            }
        }
    }

    addClass ( el, className ) {
        if ( !el ) return;
        if ( !el.length ) {
            el.classList.add( className );
        } else {
            for ( var i = 0; i < el.length; i++ ) {
                el[ i ].classList.add( className );
            }
        }
    }

    findClosest ( el, className ) {
        if ( !el ) return;
        while ( el ) {
            var parent = el.parentElement;
            if ( parent && this.hasClass( parent, className ) ) {
                return parent;
            }
            el = parent;
        }
    }

    hasClass ( el, className ) {
        if ( !el ) return;
        return (
            ` ${ el.className } `.replace( /[\n\t]/g, ' ' ).indexOf( ` ${ className } ` ) > -1
        );
    }

    toggleClass ( el, className ) {
        if ( !el ) return;
        if ( this.hasClass( el, className ) ) {
            this.removeClass( el, className );
        } else {
            this.addClass( el, className );
        }
    }

}
