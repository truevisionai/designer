/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
// import PerfectScrollbar from 'perfect-scrollbar';
import { NavigationService } from '../../services/navigation.service';

@Component( {
	selector: 'app-sidebar-top',
	templateUrl: './sidebar-top.component.html'
} )
export class SidebarTopComponent implements OnInit, OnDestroy, AfterViewInit {
	// private sidebarPS: PerfectScrollbar;
	public menuItems: any[];
	private menuItemsSub: Subscription;

	constructor (
		private navService: NavigationService
	) {
	}

	ngOnInit () {
		this.menuItemsSub = this.navService.menuItems$.subscribe( menuItem => {
			this.menuItems = menuItem.filter( item => item.type !== 'icon' && item.type !== 'separator' );
		} );
	}

	ngAfterViewInit () {
		// setTimeout(() => {
		//   this.sidebarPS = new PerfectScrollbar('#sidebar-top-scroll-area', {
		//     suppressScrollX: true
		//   })
		// })
	}

	ngOnDestroy () {
		// if(this.sidebarPS) {
		//   this.sidebarPS.destroy();
		// }
		if ( this.menuItemsSub ) {
			this.menuItemsSub.unsubscribe();
		}
	}

}
