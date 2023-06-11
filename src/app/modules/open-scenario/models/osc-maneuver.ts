import { OscParameterDeclaration } from './osc-parameter-declaration';
import { AbstractAction } from './osc-interfaces';
import { OscSourceFile } from '../services/osc-source-file';
import { OscEvent } from './osc-event';
import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/osc-player.service';
import { OscStoryElementType } from './osc-enums';

export class OscManeuver {

    private static count = 1;

    public parameterDeclaration: OscParameterDeclaration;

    public events: OscEvent[] = [];

    public hasStarted: boolean;
    public isCompleted: boolean;
    public eventIndex: number = 0;

    public completed = new EventEmitter<StoryEvent>();

    constructor ( public name: string ) {

        OscManeuver.count++;

    }

    static getNewName ( name = 'MyManeuver' ) {

        return `${ name }${ this.count }`;

    }

    addNewEvent ( name: string, priority: string ) {

        const hasName = OscSourceFile.db.has_event( name );

        if ( hasName ) throw new Error( 'Event name already used' );

        const event = new OscEvent( name, priority );

        this.addEventInstance( event );

        return event;
    }

    addEventInstance ( event: OscEvent ) {

        this.events.push( event );

        OscSourceFile.db.add_event( event.name, event );

        event.completed.subscribe( e => {
            this.onEventCompleted( e );
        } );

        return event;

    }

    private onEventCompleted ( storyEvent: StoryEvent ) {

        this.eventIndex++;

        let allCompleted = true;

        for ( const event of this.events ) {

            if ( !event.isCompleted ) {

                allCompleted = false;

                break;

            }
        }

        if ( allCompleted ) {

            this.isCompleted = true;

            this.completed.emit( {
                name: this.name,
                type: OscStoryElementType.maneuver
            } );

        }
    }
}

export class OscEventAction {

    public name: string;
    public action: AbstractAction;

}
