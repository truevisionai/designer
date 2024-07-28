/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { getQueryParam } from '../helpers/url.helper';
import { ThemeService } from './theme.service';

export interface ILayoutConf {
	navigationPos?: string;         // side, top
	sidebarStyle?: string;          // full, compact, closed
	sidebarCompactToggle?: boolean; // sidebar expandable on hover
	sidebarColor?: string;          // Sidebar background color http://demos.ui-lib.com/egret-doc/#egret-colors
	dir?: string;                   // ltr, rtl
	isMobile?: boolean;             // updated automatically
	useBreadcrumb?: boolean;        // Breadcrumb enabled/disabled
	breadcrumb?: string;            // simple, title
	topbarFixed?: boolean;          // Fixed header
	topbarColor?: string;           // Header background color http://demos.ui-lib.com/egret-doc/#egret-colors
	matTheme?: string;               // material theme. egret-blue, egret-navy, egret-dark-purple, egret-dark-pink
	perfectScrollbar?: boolean;
}

export interface ILayoutChangeOptions {
	duration?: number,
	transitionClass?: boolean
}

interface IAdjustScreenOptions {
	browserEvent?: any,
	route?: string
}


@Injectable( {
	providedIn: 'root'
} )
export class LayoutService {
	public layoutConf: ILayoutConf = {
		'navigationPos': 'side',      // side, top
		'sidebarStyle': 'closed',       // full, compact, closed
		'sidebarColor': 'dark-gray',      // http://demos.ui-lib.com/egret-doc/#egret-colors
		'sidebarCompactToggle': false, // applied when "sidebarStyle" is "compact"
		'dir': 'ltr',                 // ltr, rtl
		'useBreadcrumb': false,
		'topbarFixed': false,
		'topbarColor': 'dark-gray',       // http://demos.ui-lib.com/egret-doc/#egret-colors
		'matTheme': 'egret-dark-pink',     // egret-blue, egret-navy, egret-dark-purple, egret-dark-pink
		'breadcrumb': 'simple',       // simple, title
		'perfectScrollbar': true
	};

	layoutConfSubject = new BehaviorSubject<ILayoutConf>( this.layoutConf );
	layoutConf$ = this.layoutConfSubject.asObservable();
	public isMobile: boolean;
	public currentRoute: string;
	public fullWidthRoutes = [ 'shop' ];

	constructor (
		private router: Router,
		private themeService: ThemeService
	) {
		this.setAppLayout();
	}

	setAppLayout () {
		//******** SET YOUR LAYOUT OPTIONS HERE *********
		// this.layoutConf = {
		// 	'navigationPos': 'side',      // side, top
		// 	'sidebarStyle': 'closed',       // full, compact, closed
		// 	'sidebarColor': 'dark-gray',      // http://demos.ui-lib.com/egret-doc/#egret-colors
		// 	'sidebarCompactToggle': false, // applied when "sidebarStyle" is "compact"
		// 	'dir': 'ltr',                 // ltr, rtl
		// 	'useBreadcrumb': false,
		// 	'topbarFixed': false,
		// 	'topbarColor': 'dark-gray',       // http://demos.ui-lib.com/egret-doc/#egret-colors
		// 	'matTheme': 'egret-dark-pink',     // egret-blue, egret-navy, egret-dark-purple, egret-dark-pink
		// 	'breadcrumb': 'simple',       // simple, title
		// 	'perfectScrollbar': true
		// };

		//******* Only for demo purpose ***
		this.setLayoutFromQuery();
		//**********************
	}

	publishLayoutChange ( lc: ILayoutConf, opt: ILayoutChangeOptions = {} ) {
		if ( this.layoutConf.matTheme !== lc.matTheme && lc.matTheme ) {
			this.themeService.changeTheme( this.layoutConf.matTheme, lc.matTheme );
		}

		this.layoutConf = Object.assign( this.layoutConf, lc );
		this.layoutConfSubject.next( this.layoutConf );
	}

	applyMatTheme ( r: Renderer2 ) {
		this.themeService.applyMatTheme( r, this.layoutConf.matTheme );
	}

	setLayoutFromQuery () {
		// let layoutConfString = getQueryParam( 'layout' );
		// try {
		// 	this.layoutConf = JSON.parse( layoutConfString );
		// 	// this.publishLayoutChange(this.layoutConf);
		// } catch ( e ) {
		// }
	}

	adjustLayout ( options: IAdjustScreenOptions = {} ) {
		let sidebarStyle: string;
		this.isMobile = this.isSm();
		this.currentRoute = options.route || this.currentRoute;
		sidebarStyle = this.isMobile ? 'closed' : this.layoutConf.sidebarStyle;

		if ( this.currentRoute ) {
			this.fullWidthRoutes.forEach( route => {
				if ( this.currentRoute.indexOf( route ) !== -1 ) {
					sidebarStyle = 'closed';
				}
			} );
		}

		this.publishLayoutChange( {
			isMobile: this.isMobile,
			sidebarStyle: sidebarStyle
		} );
	}

	isSm () {
		return window.matchMedia( `(max-width: 959px)` ).matches;
	}
}
