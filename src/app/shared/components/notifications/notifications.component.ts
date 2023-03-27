/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component( {
	selector: 'app-notifications',
	templateUrl: './notifications.component.html'
} )
export class NotificationsComponent implements OnInit {
	@Input() notificPanel;

	// Dummy notifications
	notifications = [ {
		message: 'New contact added',
		icon: 'assignment_ind',
		time: '1 min ago',
		route: '/inbox',
		color: 'primary'
	}, {
		message: 'New message',
		icon: 'chat',
		time: '4 min ago',
		route: '/chat',
		color: 'accent'
	}, {
		message: 'Server rebooted',
		icon: 'settings_backup_restore',
		time: '12 min ago',
		route: '/charts',
		color: 'warn'
	} ];

	constructor ( private router: Router ) {
	}

	ngOnInit () {
		this.router.events.subscribe( ( routeChange ) => {
			if ( routeChange instanceof NavigationEnd ) {
				this.notificPanel.close();
			}
		} );
	}

	clearAll ( e ) {
		e.preventDefault();
		this.notifications = [];
	}
}
