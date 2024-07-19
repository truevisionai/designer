/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolService } from 'app/tools/maneuver/maneuver-tool.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { ManeuverMesh } from 'app/services/junction/junction.debug';
import { ManeuverControlPointInspector, ManeuverInspector } from './maneuver.inspector';
import { TvJunction } from "../../map/models/junctions/tv-junction";

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	constructor ( private tool: ManeuverToolService ) {

		super();

	}

	init () {

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.junctionDebugger.clear();
		this.tool.maneuverDebugger.clear();

	}

	onPointerMoved ( e: PointerEventData ) {

		this.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = this.selectionService.handleTargetMovement( e, this.currentSelectedPoint );

		this.currentSelectedPoint.copyPosition( newPosition.position );

		this.currentSelectedPointMoved = true;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService?.handleSelection( e );

	}

	onObjectAdded ( object: any ): void {

		// if ( object instanceof SplineControlPoint ) {
		//
		// 	this.tool.addControlPoint( object.spline, object );
		//
		// } else {
		//
		// 	super.onObjectAdded( object );
		//
		// }

	}

	onObjectRemoved ( object: any ): void {

		// if ( object instanceof SplineControlPoint ) {
		//
		// 	this.tool.removeControlPoint( object.spline, object );
		//
		// } else {
		//
		// 	super.onObjectRemoved( object );
		//
		// }

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof ManeuverMesh ) {

			this.setInspector( new ManeuverInspector( object ) );

			this.tool.maneuverDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof SplineControlPoint ) {

			this.setInspector( new ManeuverControlPointInspector( object ) );

		} else if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectSelected( obj ) );

		}

	}

	onObjectUnselected ( object: any ) {

		if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

			this.tool.maneuverDebugger.updateDebugState( object, DebugState.REMOVED );

		} else if ( object instanceof SplineControlPoint ) {

			this.clearInspector();

		} else if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.updateDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectUnselected( obj ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.tool.splineService.update( object.spline );

			const firstRoad = this.tool.splineService.findFirstRoad( object.spline );

			const junctionId = firstRoad?.junctionId;

			if ( junctionId ) {

				const junction = this.tool.junctionService.getJunctionById( junctionId );

				if ( junction ) {

					this.tool.junctionDebugger.updateDebugState( junction, DebugState.SELECTED );

				}

			}

		} else {

			super.onObjectUpdated( object );

		}

	}

}
