/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { ToolTipService, TooltipRef } from 'app/services/debug/tool-tip.service';

@Component( {
	selector: 'app-tooltip',
	templateUrl: './tooltip.component.html',
	styleUrls: [ './tooltip.component.scss' ]
} )
export class TooltipComponent implements OnInit {

	constructor ( private tooltipService: ToolTipService ) { }

	tooltips: TooltipRef[] = [];

	ngOnInit (): void {

		this.tooltips = Array.from( this.tooltipService.getTooltips().values() );

		this.tooltipService.tooltipAdded.subscribe( tooltip => {

			this.tooltips.push( tooltip );

		} );

		this.tooltipService.tooltipUpdated.subscribe( tooltip => {

			// const current = this.tooltips.find( i => i.id == tooltip.id );
			// if ( current ) {
			// 	current.position.copy( tooltip.position );
			// 	current.content = tooltip.content;
			// }

		} );

		this.tooltipService.tooltipRemoved.subscribe( tooltip => {

			const index = this.tooltips.findIndex( i => i.id == tooltip.id );

			if ( index != -1 ) {

				this.tooltips.splice( index, 1 );

			}

		} );
	}

}
