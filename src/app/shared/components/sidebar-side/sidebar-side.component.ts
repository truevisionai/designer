/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ILayoutConf, LayoutService } from 'app/shared/services/layout.service';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../shared/services/navigation.service';
import { ThemeService } from '../../services/theme.service';

@Component( {
    selector: 'app-sidebar-side',
    templateUrl: './sidebar-side.component.html'
} )
export class SidebarSideComponent implements OnInit, OnDestroy, AfterViewInit {
    public menuItems: any[];
    public hasIconTypeMenuItem: boolean;
    public iconTypeMenuTitle: string;
    public layoutConf: ILayoutConf;
    private menuItemsSub: Subscription;

    constructor (
        private navService: NavigationService,
        public themeService: ThemeService,
        private layout: LayoutService
    ) {
    }

    ngOnInit () {
        this.iconTypeMenuTitle = this.navService.iconTypeMenuTitle;
        this.menuItemsSub = this.navService.menuItems$.subscribe( menuItem => {
            this.menuItems = menuItem;
            //Checks item list has any icon type.
            this.hasIconTypeMenuItem = !!this.menuItems.filter(
                item => item.type === 'icon'
            ).length;
        } );
        this.layoutConf = this.layout.layoutConf;
    }

    ngAfterViewInit () {
    }

    ngOnDestroy () {
        if ( this.menuItemsSub ) {
            this.menuItemsSub.unsubscribe();
        }
    }

    toggleCollapse () {
        if (
            this.layoutConf.sidebarCompactToggle
        ) {
            this.layout.publishLayoutChange( {
                sidebarCompactToggle: false
            } );
        } else {
            this.layout.publishLayoutChange( {
                // sidebarStyle: "compact",
                sidebarCompactToggle: true
            } );
        }
    }
}
