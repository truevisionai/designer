import { Injectable } from '@angular/core';
import { SelectObjectCommandv2, UnselectObjectCommandv2 } from 'app/commands/select-point-command';
import { MovingStrategy } from 'app/core/snapping/move-strategies/move-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/modules/scenario/models/position';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { CommandHistory } from 'app/services/command-history';
import { StatusBarService } from 'app/services/status-bar.service';


@Injectable( {
	providedIn: 'root'
} )
export class BaseToolService {

	private selectionStratgies: SelectStrategy<any>[] = [];
	private movingStrategies: MovingStrategy[] = [];
	private currentSelected: any;

	constructor (
		public statusBar: StatusBarService,
	) { }

	addSelectionStrategy ( strategy: SelectStrategy<any> ) {

		this.selectionStratgies.push( strategy );

	}

	getSelectionStrategies (): SelectStrategy<any>[] {

		return this.selectionStratgies;

	}

	addMovingStrategy ( strategy: MovingStrategy ) {

		this.movingStrategies.push( strategy );

	}

	getMovingStrategies (): MovingStrategy[] {

		return this.movingStrategies;

	}

	setSelected ( object: any ) {

		this.currentSelected = object;

	}

	getSelected<T> (): T {

		return this.currentSelected as T;

	}

	select ( e: PointerEventData ): void {

		for ( let i = 0; i < this.selectionStratgies.length; i++ ) {

			const element = this.selectionStratgies[ i ];

			const result = element.select( e );

			if ( result ) {

				if ( result === this.currentSelected ) return;

				CommandHistory.execute( new SelectObjectCommandv2( result, this.currentSelected ) );

				this.currentSelected = result;

				return;
			}

		}

		if ( this.currentSelected ) {

			CommandHistory.execute( new UnselectObjectCommandv2( this.currentSelected ) );

			this.currentSelected = null;

		}

	}

	onPointerDown ( e: PointerEventData ) {

		for ( let i = 0; i < this.selectionStratgies.length; i++ ) {

			const element = this.selectionStratgies[ i ];

			const result = element.select( e );

			if ( result ) return result;

		}

	}

	onPointerMoved ( e: PointerEventData ) {

		for ( let i = 0; i < this.selectionStratgies.length; i++ ) {

			const element = this.selectionStratgies[ i ];

			const result = element.onPointerMoved( e );

			if ( result ) return result;

		}

	}

	move ( e: PointerEventData ): Position {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const position = this.movingStrategies[ i ].getPosition( e );

			if ( position ) return position;

		}

	}

	clearStrategies () {

		this.selectionStratgies.forEach( s => s.dispose() );
		// this.movingStrategies.forEach( s => s.dispose() );

		this.selectionStratgies = [];
		this.movingStrategies = [];
	}

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	clearHint () {

		StatusBarService.clearHint();

	}

	init () {

		this.clearStrategies();

		this.currentSelected = null;

	}

}
