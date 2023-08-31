/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { TvConsole, TvLog } from 'app/core/utils/console';

@Component( {
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: [ './console.component.css' ]
} )
export class ConsoleComponent implements OnInit {

	log: TvLog;

	@ViewChild( 'popover', { static: false } ) popover: SatPopover;

	constructor (
		private viewContainerRef: ViewContainerRef,
	) {
	}

	get logs () {
		return TvConsole.logs;
	}

	ngOnInit () {
	}

	onMouseOver ( log: TvLog ) {

		if ( log.message.length > 100 ) {

			this.popover.setCustomAnchor( this.viewContainerRef, this.viewContainerRef.element.nativeElement );

			this.popover.open( {
				restoreFocus: false,
				autoFocus: false
			} );

			this.log = log;

		} else {

			this.popover.close();

			this.log = null;

		}

	}

	onMouseOut ( tool: any ) {

		this.popover.anchor = null;

		this.popover.close();

		this.log = null;

	}


	clear () {

		TvConsole.clear();

	}

}
