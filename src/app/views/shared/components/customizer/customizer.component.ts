/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, Renderer2 } from '@angular/core';
import { CustomizerService } from 'app/views/shared/services/customizer.service';
import { ITheme, ThemeService } from 'app/views/shared/services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { NavigationService } from '../../services/navigation.service';

@Component( {
	selector: 'app-customizer',
	templateUrl: './customizer.component.html',
	styleUrls: [ './customizer.component.scss' ]
} )
export class CustomizerComponent implements OnInit {
	isCustomizerOpen: boolean = false;
	viewMode: 'options' | 'json' = 'options';
	sidenavTypes = [
		{
			name: 'Default Menu',
			value: 'default-menu'
		},
		{
			name: 'Separator Menu',
			value: 'separator-menu'
		},
		{
			name: 'Icon Menu',
			value: 'icon-menu'
		}
	];
	sidebarColors: any[];
	topbarColors: any[];

	layoutConf;
	selectedMenu: string = 'icon-menu';
	selectedLayout: string;
	isTopbarFixed = false;
	isRTL = false;
	egretThemes: ITheme[];

	constructor (
		private navService: NavigationService,
		private layout: LayoutService,
		private themeService: ThemeService,
		public customizer: CustomizerService,
		private renderer: Renderer2
	) {
	}

	ngOnInit () {
		this.layoutConf = this.layout.layoutConf;
		this.selectedLayout = this.layoutConf.navigationPos;
		this.isTopbarFixed = this.layoutConf.topbarFixed;
		this.isRTL = this.layoutConf.dir === 'rtl';
		this.egretThemes = this.themeService.egretThemes;
	}

	changeTheme ( theme ) {
		// this.themeService.changeTheme(theme);
		this.layout.publishLayoutChange( { matTheme: theme.name } );
	}

	changeLayoutStyle ( data ) {
		this.layout.publishLayoutChange( { navigationPos: this.selectedLayout } );
	}

	changeSidenav ( data ) {
		this.navService.publishNavigationChange( data.value );
	}

	toggleBreadcrumb ( data ) {
		this.layout.publishLayoutChange( { useBreadcrumb: data.checked } );
	}

	toggleTopbarFixed ( data ) {
		this.layout.publishLayoutChange( { topbarFixed: data.checked } );
	}

	toggleDir ( data ) {
		let dir = data.checked ? 'rtl' : 'ltr';
		this.layout.publishLayoutChange( { dir: dir } );
	}

}
