/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tools/tool-types.enum';
import { BaseTool } from '../tools/base-tool';
import { PointerTool } from '../tools/pointer/pointer-tool';
import { VehicleTool } from '../tools/vehicle/vehicle-tool';

export class ToolFactory {

	static createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

	}
}
