/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { ToolType } from '../tool-types.enum';
import { BoxSelectionConfig } from '../box-selection-service';
import { ToolWithHandler } from '../base-tool-v2';
import { PropPointToolService } from './prop-point-tool.service';
import { PropInstanceController } from './controllers/prop-instance-controller.service';
import { PropInstanceVisualizer } from './visualizers/prop-instance-visualizer.service';
import { PropInstanceCreationStrategy } from './strategies/prop-instance-creation.strategy';
import { PropInstanceDragHandler } from './handlers/prop-instance-drag-handler.service';
import { PointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';

export class PropPointTool extends ToolWithHandler {

	public name: string = 'PropPointTool';

	public toolType = ToolType.PropPoint;

	private readonly propSelectionStrategy = new PointSelectionStrategy({
		returnTarget: true
	});

	constructor ( private readonly tool: PropPointToolService ) {

		super();

	}

	init (): void {

		super.init();

		this.addSelectionStrategy( PropInstance, this.propSelectionStrategy );

		this.addController( PropInstance, this.tool.base.injector.get( PropInstanceController ) );

		this.addVisualizer( PropInstance, this.tool.base.injector.get( PropInstanceVisualizer ) );

		this.addDragHandler( PropInstance, this.tool.base.injector.get( PropInstanceDragHandler ) );

		this.addCreationStrategy( this.tool.base.injector.get( PropInstanceCreationStrategy ) );

		this.setHint( 'Use SHIFT + LEFT CLICK to place props' );

		this.tool.base.map.getProps().forEach( prop => {
			this.tool.base.injector.get( PropInstanceVisualizer ).onDefault( prop );
		} );

	}

	getBoxSelectionConfig (): BoxSelectionConfig {
		return {
			strategy: this.propSelectionStrategy,
		};
	}

}
