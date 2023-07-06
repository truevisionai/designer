import { Type } from '@angular/core';
import { ISelectable } from '../../modules/three-js/objects/i-selectable';
import { IComponent } from '../game-object';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';

export interface IToolWithPoint {
	setPoint ( value: ISelectable ): void;
	getPoint (): ISelectable;
}


export interface IToolWithMainObject {
	setMainObject ( value: ISelectable ): void;
	getMainObject (): ISelectable;
}

export class SelectPointCommand extends BaseCommand {

	private readonly oldPoint: ISelectable;
	private readonly setInspectorCommand: SetInspectorCommand;

	constructor (
		private tool: IToolWithPoint,
		private newPoint: ISelectable,
		inspector?: Type<IComponent>,
		inspectorData?: any
	) {
		super();

		this.oldPoint = this.tool.getPoint();

		if ( inspector ) {
			this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
		}
	}

	execute () {

		this.oldPoint?.unselect();

		this.newPoint?.select();

		this.tool.setPoint( this.newPoint );

		this.setInspectorCommand?.execute();

	}

	undo (): void {

		this.oldPoint?.select();

		this.newPoint?.unselect();

		this.tool.setPoint( this.oldPoint );

		this.setInspectorCommand?.undo();

	}

	redo (): void {

		this.execute();

	}
}



export class SelectMainObjectCommand extends BaseCommand {

	protected readonly oldMainObject: ISelectable;

	constructor ( protected tool: IToolWithMainObject, protected newMainObject: ISelectable ) {
		super();
		this.oldMainObject = this.tool.getMainObject();
	}

	execute () {
		this.oldMainObject?.unselect();
		this.newMainObject?.select();
		this.tool.setMainObject( this.newMainObject );
	}

	undo (): void {
		this.oldMainObject?.select();
		this.newMainObject?.unselect();
		this.tool.setMainObject( this.oldMainObject );
	}

	redo (): void {
		this.execute();
	}
}
