/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { StatusBarService } from "app/services/status-bar.service";
import { CreationStrategy } from "../core/interfaces/creation-strategy";
import { SnackBar } from "app/services/snack-bar.service";

export class ObjectCreationManager {

	private strategies: CreationStrategy<any>[] = [];

	constructor () {

		this.strategies = [];

	}

	addStrategy ( strategy: CreationStrategy<any> ): void {

		this.strategies.push( strategy );

	}

	validate ( event: PointerEventData ): boolean {

		for ( const strategy of this.strategies ) {

			if ( strategy.validate( event ) ) {

				return

			}

		}

		return false;

	}

	/**
	 * Attempts to create an object using the available strategies.
	 * If all strategies fail validation, displays collected hints.
	 * @param event Pointer event data.
	 * @returns The created object or null if creation failed.
	 */
	tryCreatingObject ( event: PointerEventData ): any | null {

		const messages: string[] = [];

		for ( const strategy of this.strategies ) {

			const validation = strategy.validate( event );

			if ( validation.passed ) {

				const createdObject = strategy.createObject( event );

				if ( createdObject ) {

					return createdObject;

				} else {

					throw new Error( `Creation strategy failed to create object` );

				}

			} else {

				messages.push( validation.message );

			}

		}

		this.showMessages( messages );

	}

	private showMessages ( messages: string[] ): void {

		if ( messages.length == 0 ) return;

		StatusBarService.setHint( messages[ 0 ] );

		SnackBar.instance?.warn( messages[ 0 ] );

	}

}
