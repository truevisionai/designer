/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { ICommand } from './i-command';

export class MultiCmdsCommand extends BaseCommand {

    constructor ( private commands: ICommand[] ) {
        super();
    }

    execute (): void {

        this.commands.forEach( command => command.execute() );

    }

    undo (): void {

        this.commands.forEach( command => command.undo() );

    }

    redo (): void {

        this.commands.forEach( command => command.redo() );

    }

}