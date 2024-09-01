/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionToolHelper } from './junction-tool.helper';
import { JunctionNode } from 'app/services/junction/junction-node';
import { JunctionNodeSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { JunctionInspector } from './junction.inspector';
import { DebugState } from 'app/services/debug/debug-state';
import { Log } from 'app/core/utils/log';
import { Commands } from 'app/commands/commands';
import { JunctionSelectionStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";

export class JunctionTool extends BaseTool<any> {

	public name: string = 'JunctionTool';

	public toolType = ToolType.Junction;

	private selectedNodes: JunctionNode[] = [];

	private debug: boolean = true;

	private highlightedNode: JunctionNode;

	constructor ( private helper: JunctionToolHelper ) {

		super();

	}

	init () {

		this.setHint( 'Click on a road to create a junction' );

		this.helper.base.addSelectionStrategy( new JunctionNodeSelectionStrategy() );
		this.helper.base.addSelectionStrategy( new JunctionSelectionStrategy() );

		this.setDebugService( this.helper.junctionDebugger );
		this.setDataService( this.helper.junctionService );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const selected = this.selectionService.getSelectedObjects();

		this.helper.base.handleSelection( e, ( object ) => {

			if ( this.debug ) console.debug( 'onPointerDownSelect', object, 'old', selected );

			if ( object instanceof JunctionNode ) {

				// dont unselect if the object is already selected
				this.selectObject( object, null );

			} else if ( object instanceof TvJunction ) {

				this.selectObject( object, null );

			}

		}, () => {

			if ( this.selectedNodes.length > 0 ) {
				this.unselectObject( this.selectedNodes );
				return;
			}

			if ( selected.length > 0 ) {
				this.unselectObject( selected );
			}


		} )

		// const node = this.nodeStrategy.onPointerMoved( e );

		// if ( node ) {

		// 	node.select();

		// 	this.selectedNodes.push( node );

		// 	if ( this.selectedNodes.length === 3 ) {

		// 		this.junctionService.createJunctionFromJunctionNodes( this.selectedNodes );

		// 		this.selectedNodes.splice( 0, this.selectedNodes.length );

		// 	}

		// 	return;
		// };

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		// const roadCoord = this.roadStrategy.onPointerDown( e );

		// if ( roadCoord ) {

		// 	SceneService.addToolObject( this.tool.debug.createRoadWidthLine( roadCoord ) );

		// 	this.selectedCoords.push( roadCoord );

		// }

		// if ( this.selectedCoords.length === 2 ) {

		// 	const junction = this.tool.createJunctionFromCoords( this.selectedCoords );

		// 	// SceneService.addToolObject( junction );

		// 	this.selectedCoords.splice( 0, this.selectedCoords.length );

		// }

	}

	onPointerMoved ( e: PointerEventData ): void {

		const object = this.helper.base.highlight( e );

		if ( this.debug ) console.debug( 'onPointerMoved', object );

		this.highlightedNode?.onMouseOut(); // remove highlight

		if ( object instanceof JunctionNode ) {

			this.highlightedNode = object;

			this.highlightedNode?.onMouseOver();

		} else if ( object instanceof TvJunction ) {

			// object?.select();

		}

		// // if ( this.nodeStrategy.onPointerMoved( e ) ) return;

		// const roadCoord = this.roadStrategy.onPointerMoved( e );

		// if ( this.debugLine ) this.debugLine.visible = false;

		// if ( !roadCoord ) return;

		// if ( !this.debugLine ) {

		// 	this.debugLine = this.tool.debug.createRoadWidthLine( roadCoord );

		// 	SceneService.addToolObject( this.debugLine );

		// }

		// this.debugLine.visible = true;

		// this.debugLine = this.tool.debug.updateRoadWidthLine( this.debugLine, roadCoord );

	}

	onKeyDown ( e: KeyboardEvent ): void {

		if ( this.selectedNodes.length < 2 ) return;

		if ( this.debug ) Log.info( 'onKeyDown', e );

		if ( e.code !== 'Space' ) return;

		if ( this.debug ) Log.info( 'Space', this.selectedNodes );

		const links = this.selectedNodes.map( node => node.link );

		const coords = links.map( link => link.toRoadCoord() );

		// const junction = this.helper.createJunctionFromCoords( coords );

		const junction = this.helper.createCustomJunction( links );

		Commands.AddObject( junction );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.debug( 'onObjectAdded', object );

		if ( object instanceof TvJunction ) {

			this.helper.addJunction( object );

			this.setInspector( new JunctionInspector( object ) );

			this.debugService.updateDebugState( object, DebugState.DEFAULT );

			this.debugService.enable();

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.debug( 'onObjectRemoved', object );

		if ( object instanceof TvJunction ) {

			this.helper.removeJunction( object );

		} else if ( object instanceof JunctionNode ) {


		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectSelected', object );

		if ( object instanceof JunctionNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvJunction ) {

			this.setInspector( new JunctionInspector( object ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectUnselected', object );

		if ( object instanceof JunctionNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvJunction ) {

			this.clearInspector();

		}

	}

	onNodeSelected ( node: JunctionNode ) {

		Log.info( 'onNodeSelected', node.link.contactPoint );

		node?.select();

		this.selectedNodes.push( node );
	}

	onNodeUnselected ( node: JunctionNode ) {

		if ( this.debug ) console.debug( 'onNodeUnselected', node.link.contactPoint );

		node?.unselect();

		this.selectedNodes.splice( this.selectedNodes.indexOf( node ), 1 );
	}

}
