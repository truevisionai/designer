/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ICommand {

    callbacks?: ICommandCallback;

    execute (): void;

    undo (): void;

    redo (): void;

}

export interface ICommandCallback {

    onExecute (): void;

    onUndo (): void;

    onRedo (): void;

}