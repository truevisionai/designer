/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { IHasPosition } from "app/objects/i-has-position";
import { StatusBarService } from "app/services/status-bar.service";
import { CreationStrategy } from "../core/interfaces/creation-strategy";
import { SnackBar } from "app/services/snack-bar.service";

type T = IHasPosition;

export class ObjectCreationManager {

	private strategies: CreationStrategy<T>[] = [];

	constructor () {

		this.strategies = [];

	}

	addStrategy ( strategy: CreationStrategy<T> ): void {

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
	tryCreatingObject ( event: PointerEventData ): T | null {

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
