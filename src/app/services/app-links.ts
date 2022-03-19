/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Environment } from 'app/core/utils/environment';

export class AppLinks {

    static get base () { return Environment.websiteUrl; }

    static get contactUsLink () { return this.base + 'contact'; }

    static get createAccountLink () { return this.base + 'contact'; }

    static get forgotPasswordLink () { return this.base + 'password/reset'; }

    static get truevisionManualLink () { return this.base + 'docs/simulator'; }

    static get documentationLink () { return this.base + 'designer/docs'; }

    static get scriptingReference () { return this.base + 'docs/scripting-reference'; }

    static get roadEditorManualLink () { return this.base + 'docs/road-editor'; }

    static get scenarioEditorManualLink () { return this.base + 'docs/scenario-editor'; }

    static get vehicleEditorManualLink () { return this.base + 'docs/vehicle-editor'; }

    static get sensorEditorManualLink () { return this.base + 'docs/sensor-editor'; }

    static get gradingEditorManualLink () { return this.base + 'docs/grading-editor'; }

    static get reportBugLink () { return this.base + 'docs/grading-editor'; }

    static get aboutTruevisionLink () { return this.base + 'docs/grading-editor'; }

}
