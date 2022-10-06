/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { environment } from '../../../environments/environment';

export class Environment {

    static get production (): boolean {

        return environment.production;

    }

    static get oscEnabled (): boolean {

        return environment.osc_enabled;

    }

    static get websiteUrl (): string {

        return environment.web_url;

    }

}
