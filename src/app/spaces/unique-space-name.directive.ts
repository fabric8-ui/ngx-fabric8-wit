import { SpaceService } from './space.service';
import { Observable, Subject } from 'rxjs';
import { UserService } from 'ngx-login-client';
import { SimpleChanges, OnChanges, Directive, Input, forwardRef } from '@angular/core';
import {
  AbstractControl,
  Validators,
  Validator,
  NG_ASYNC_VALIDATORS,
  AsyncValidatorFn
} from '@angular/forms';

import 'rxjs/operators/first';
import 'rxjs/operators/takeUntil';

@Directive({
  selector: '[uniqueSpaceName][ngModel]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => UniqueSpaceNameValidatorDirective), multi: true
  }]
})
export class UniqueSpaceNameValidatorDirective implements Validator, OnChanges {


  @Input() uniqueSpaceName: boolean;

  private valFn: any;

  constructor(private spaceService: SpaceService, private userService: UserService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['uniqueSpaceName'];
    if (change) {
      this.valFn = uniqueSpaceNameValidator(this.spaceService, this.userService);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): Observable<{ [key: string]: any }> {
    return this.valFn(control);
  }

}

export function uniqueSpaceNameValidator(
  spaceService: SpaceService,
  userService: UserService): AsyncValidatorFn {

  let changed$ = new Subject<any>();

  return (control: AbstractControl): Observable<{ [key: string]: any }> => {
    changed$.next();
    return control.valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .takeUntil(changed$)
      .switchMap(() => userService.loggedInUser
        .switchMap(user => {
          return spaceService
            .getSpaceByName(user.attributes.username, control.value ? control.value.replace(' ', '_') : control.value)
            .map(val => {
              return {
                unique: {
                  valid: false,
                  existingSpace: val,
                  requestedName: control.value,
                  message: `The Space Name ${control.value}  is already in use as ${val.relationalData.creator.attributes.username}/${val.attributes.name}`
                }
              };
            })
            .catch(() => {
              return Observable.of(null);
            });
        }))
      .first();
  };
}
