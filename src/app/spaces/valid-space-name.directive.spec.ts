import { async, TestBed } from '@angular/core/testing';
import { ValidSpaceNameValidatorDirective } from './valid-space-name.directive';
import { FormsModule, NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <form>
      <input name="spaceName" [ngModel]="spaceName" validSpaceName />
    </form>
  `
})
class TestSpaceNameComponent {
  spaceName: string;
}

describe('Directive for Name Space', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestSpaceNameComponent, ValidSpaceNameValidatorDirective]
    });
  });

  it('Validate false when name starts with unsupported characters', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      // when
      input.nativeElement.value = '_start2';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('invalid')).toBe(true);
        expect(control.errors.invalid.valid).toBeFalsy();
        expect(control.errors.invalid.valid).toBeFalsy();
        let expectedMessage =
          'Space Name must contain only letters, numbers, underscores (_) ' +
          'or hyphens (-). It cannot start or end with an underscore or a hyphen';
        expect(control.errors.invalid.message).toEqual(expectedMessage);
      });
    });
  }));

  it('Validate false when name ends with unsupported characters', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let comp = fixture.componentInstance;
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      // when
      input.nativeElement.value = 'start2_';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('invalid')).toBe(true);
        expect(control.errors.invalid.valid).toBeFalsy();
        let expectedMessage =
          'Space Name must contain only letters, numbers, underscores (_) ' +
          'or hyphens (-). It cannot start or end with an underscore or a hyphen';
        expect(control.errors.invalid.message).toEqual(expectedMessage);
      });
    });
  }));

  it('Validate true when underscore in the middle', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let comp = fixture.componentInstance;
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      // when
      input.nativeElement.value = 'start_3';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.errors).toBeNull();
      });
    });
  }));

  it('Validate false when there are too many characters', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      // when
      input.nativeElement.value =
        's1234567890123456789012345678901234567890123456789012345678901234567890';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('maxLength')).toBe(true);
        expect(control.errors.maxLength.valid).toBeFalsy();
        let expectedMessage =
          'Space Name cannot be more than 63 characters long';
        expect(control.errors.maxLength.message).toEqual(expectedMessage);
      });
    });
  }));
});
