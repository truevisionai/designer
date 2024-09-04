/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionToolHelper } from './junction-tool.helper';
import { JunctionNode } from 'app/services/junction/junction-node';
import { JunctionNodeSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { Log } from 'app/core/utils/log';
import { Commands } from 'app/commands/commands';
import { JunctionSelectionStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";
import { ToolWithHandler } from '../base-tool-v2';
import { JunctionNodeController, JunctionNodeVisualizer, JunctionToolJunctionController, JunctionToolJunctionVisualizer } from './junction-handlers';

export class JunctionTool extends ToolWithHandler {

	public name: string = 'JunctionTool';

	public toolType = ToolType.Junction;

	private selectedNodes: JunctionNode[] = [];

	private debug: boolean = true;

	constructor ( private helper: JunctionToolHelper ) {

		super();

	}

	init () {

		this.setHint( 'Click on a road to create a junction' );

		this.addSelectionStrategy( JunctionNode.name, new JunctionNodeSelectionStrategy() );
		this.addSelectionStrategy( TvJunction.name, new JunctionSelectionStrategy() );

		this.setDebugService( this.helper.junctionDebugger );
		this.setDataService( this.helper.junctionService );

		this.addController( JunctionNode.name, this.helper.base.injector.get( JunctionNodeController ) );
		this.addController( TvJunction.name, this.helper.base.injector.get( JunctionToolJunctionController ) );

		this.addVisualizer( JunctionNode.name, this.helper.base.injector.get( JunctionNodeVisualizer ) );
		this.addVisualizer( TvJunction.name, this.helper.base.injector.get( JunctionToolJunctionVisualizer ) );

	}

	override onPointerDownSelect ( e: PointerEventData ): void {

		if ( this.selectedNodes.length > 0 ) {

			// IF user has selected a node we want to follow custom logic

			this.selectionService.handleSelectionWithoutDeselection( e, () => {

				if ( this.selectedNodes.length == 0 ) return;

				this.unselectObject( this.selectedNodes );

			} );

		} else {

			this.selectionService.handleSelection( e );

		}

	}

	override onKeyDown ( e: KeyboardEvent ): void {

		if ( this.selectedNodes.length < 2 ) return;

		if ( this.debug ) Log.info( 'onKeyDown', e );

		if ( e.code !== 'Space' ) return;

		if ( this.debug ) Log.info( 'Space', this.selectedNodes );

		const links = this.selectedNodes.map( node => node.link );

		const junction = this.helper.createCustomJunction( links );

		Commands.AddObject( junction );

	}

	override onObjectSelected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectSelected', object );

		if ( object instanceof JunctionNode ) {
			this.selectedNodes.push( object );
		} else {
			this.selectedNodes.forEach( node => node.unselect() );
			this.selectedNodes = [];
		}

		super.onObjectSelected( object );
	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectUnselected', object );

		if ( object instanceof JunctionNode ) {
			this.selectedNodes.splice( this.selectedNodes.indexOf( object ), 1 );
		}

		super.onObjectUnselected( object );
	}

}
