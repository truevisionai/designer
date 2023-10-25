// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { IToolWithMainObject, SelectMainObjectCommand } from 'app/core/commands/select-point-command';
// import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
// import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
// import { CommandHistory } from 'app/services/command-history';
// import { PointerEventData } from '../../../events/pointer-event-data';
// import { ToolType } from '../../models/tool-types.enum';
// import { BaseTool } from '../base-tool';
// import { ObjectTagStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';
// import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';

// export class ImageTool extends BaseTool implements IToolWithMainObject {

// 	public name: string = 'ImageTool';

// 	public toolType = ToolType.ImageTool;

// 	private image: any;

// 	private pointerStrategy: SelectStrategy<any>;

// 	init (): void {

// 		this.pointerStrategy = new ObjectTagStrategy( 'image' );

// 	}

// 	disable (): void {

// 		super.disable();

// 		this.pointerStrategy?.dispose();

// 	}

// 	setMainObject ( value: ISelectable ): void {

// 		this.image = value;

// 	}

// 	getMainObject (): ISelectable {

// 		return this.image;

// 	}

// 	onPointerDownSelect ( e: PointerEventData ): void {

// 		const image = this.pointerStrategy?.onPointerDown( e );

// 		if ( !image ) {

// 			CommandHistory.execute( new SelectMainObjectCommand( this, null ) );

// 		} else if ( !this.image || this.image.uuid != image.uuid ) {

// 			CommandHistory.execute( new SelectMainObjectCommand( this, image, DynamicInspectorComponent, image ) );

// 		}
// 	}
// }
