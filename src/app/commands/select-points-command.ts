import { BaseCommand } from "./base-command";
import { ISelectable } from "../modules/three-js/objects/i-selectable";
import { SetInspectorCommand } from "./set-inspector-command";
import { Type } from "@angular/core";
import { IComponent } from "../core/game-object";
import { IToolWithPoints } from "./select-point-command";

/**
 * @deprecated
 */
export class SelectPointsCommand extends BaseCommand {

    private readonly oldPoint: ISelectable[];
    private readonly setInspectorCommand: SetInspectorCommand;

    constructor (
        private tool: IToolWithPoints,
        private newPoint: ISelectable[] = [],
        inspector: Type<IComponent> = null,
        inspectorData: ISelectable[] = []
    ) {
        super();

        this.oldPoint = this.tool.getPoint();

        this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
    }

    execute () {

        this.oldPoint.forEach( i => i.unselect() );

        this.newPoint?.forEach( i => i.select() );

        this.tool.setPoint( this.newPoint );

        this.setInspectorCommand?.execute();

    }

    undo (): void {

        this.newPoint.forEach( i => i.unselect() );

        this.oldPoint.forEach( i => i.select() );

        this.tool.setPoint( this.oldPoint );

        this.setInspectorCommand?.undo();

    }

    redo (): void {

        this.execute();

    }
}