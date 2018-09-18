import { UniqueSpaceNameValidatorDirective } from './unique-space-name.directive';
import { ValidSpaceNameValidatorDirective } from './valid-space-name.directive';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    UniqueSpaceNameValidatorDirective,
    ValidSpaceNameValidatorDirective
  ],
  exports: [
    UniqueSpaceNameValidatorDirective,
    ValidSpaceNameValidatorDirective
  ]
})
export class SpaceNameModule {
}
