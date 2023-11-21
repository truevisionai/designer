import { BaseCommand } from "./base-command";
import { ISelectable } from "../modules/three-js/objects/i-selectable";
import { SetInspectorCommand } from "./set-inspector-command";
import { Type } from "@angular/core";
import { IComponent } from "../core/game-object";
import { IToolWithMainObject } from "./select-point-command";

/**
 * @deprecated
 */
export class SelectMainObjectCommand extends BaseCommand {

    private readonly oldMainObject: ISelectable;
    private readonly setInspectorCommand: SetInspectorCommand;

    constructor (
        private tool: IToolWithMainObject,
        private newMainObject: ISelectable,
        private inspector: Type<IComponent> = null,
        private inspectorData: any = null
    ) {
        super();

        this.oldMainObject = this.tool.getMainObject();

        this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
    }

    execute () {

        this.oldMainObject?.unselect();

        this.newMainObject?.select();

        this.tool.setMainObject( this.newMainObject );

        this.setInspectorCommand?.execute();

    }

    undo (): void {

        this.oldMainObject?.select();

        this.newMainObject?.unselect();

        this.tool.setMainObject( this.oldMainObject );

        this.setInspectorCommand?.undo();

    }

    redo (): void {

        this.execute();

    }

}