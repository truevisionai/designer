/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from "../inspector";
import { StatusBarService } from "../../services/status-bar.service";
import { Controller } from "./controller";

export abstract class BaseController<T> implements Controller<T> {

	abstract onAdded ( object: T ): void;

	abstract onUpdated ( object: T ): void;

	abstract onRemoved ( object: T ): void;

	abstract showInspector ( object: T ): void;

	clearInspector (): void {

		AppInspector.clear();

	}

	setInspector ( data: any ): void {

		AppInspector.setDynamicInspector( data );

	}

	setHint ( msg: string ): void {

		StatusBarService.setHint( msg );

	}

	validate ( object: T ): void {

		// Do nothing by default

	}

	disable (): void {

	}

}
