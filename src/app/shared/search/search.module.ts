/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchInputOverComponent } from "./search-input-over/search-input-over.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule, MatButtonModule } from "@angular/material";

@NgModule({
  declarations: [SearchInputOverComponent],
  exports: [SearchInputOverComponent],
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, CommonModule]
})
export class SearchModule {}
