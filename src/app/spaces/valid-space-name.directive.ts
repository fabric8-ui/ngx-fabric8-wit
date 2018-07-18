import { Observable, Subject } from 'rxjs';
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
  selector: '[validSpaceName][ngModel]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => ValidSpaceNameValidatorDirective), multi: true
  }]
})
export class ValidSpaceNameValidatorDirective implements Validator, OnChanges {

  static readonly MIN_SPACE_NAME_LENGTH = 1;
  static readonly MAX_SPACE_NAME_LENGTH = 63;


  @Input() validSpaceName: boolean;

  private valFn: any;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['validSpaceName'];
    if (change) {
      this.valFn = validSpaceNameValidator();
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): Observable<{ [key: string]: any }> {
    return this.valFn(control);
  }

}

export function validSpaceNameValidator(): AsyncValidatorFn {

  let changed$ = new Subject<any>();
  let ALLOWED_SPACE_NAMES = /(^[a-z\d][a-z\d-_]*[a-z\d]$)|(^[a-z\d]$)/i;

  return (control: AbstractControl): Observable<{ [key: string]: any }> => {
    changed$.next();
    return control.valueChanges
      .debounceTime(50)
      .distinctUntilChanged()
      .takeUntil(changed$)
      .map(() => {
        if (!control.value || control.value.toString().length > ValidSpaceNameValidatorDirective.MAX_SPACE_NAME_LENGTH) {
          return {
            maxLength: {
              valid: false,
              requestedName: control.value,
              max: ValidSpaceNameValidatorDirective.MAX_SPACE_NAME_LENGTH,
              message: `Space Name cannot be more than ${ValidSpaceNameValidatorDirective.MAX_SPACE_NAME_LENGTH} characters long`
            }
          };
        }
        let strVal: string = control.value.toString();
        if (strVal.length < ValidSpaceNameValidatorDirective.MIN_SPACE_NAME_LENGTH) {
          return {
            minLength: {
              valid: false,
              requestedName: control.value,
              min: ValidSpaceNameValidatorDirective.MIN_SPACE_NAME_LENGTH,
              message: `Space Name must be at least ${ValidSpaceNameValidatorDirective.MIN_SPACE_NAME_LENGTH} characters long.`
            }
          };
        } else if (!strVal.match(ALLOWED_SPACE_NAMES)) {
          return {
            invalid: {
              valid: false,
              requestedName: control.value,
              allowedChars: ALLOWED_SPACE_NAMES,
              message:
                'Space Name must contain only letters, numbers, underscores (_)' +
                'or hyphens(-). It cannot start or end with an underscore or a hyphen'
            }
          };
        }
        return null;
      })
      .first();
  };
}
