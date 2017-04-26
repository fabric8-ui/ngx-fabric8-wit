import { async, TestBed } from '@angular/core/testing';
import { ValidSpaceNameValidatorDirective, validSpaceNameValidator } from './valid-space-name.directive'
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
    let comp = fixture.componentInstance;
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent( new Event('input'));
    fixture.detectChanges();

   fixture.whenStable().then(() => {
     // when
      input.nativeElement.value = '_start2';
      input.nativeElement.dispatchEvent( new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('invalid')).toBe(true);
        expect(control.errors.invalid.valid).toBeFalsy();
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
    input.nativeElement.dispatchEvent( new Event('input'));
    fixture.detectChanges();

   fixture.whenStable().then(() => {
     // when
      input.nativeElement.value = 'start_3';
      input.nativeElement.dispatchEvent( new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.errors).toBeNull();
      });
   });
  }));

  it('Validate false when there is not enough characters', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let comp = fixture.componentInstance;
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent( new Event('input'));
    fixture.detectChanges();

   fixture.whenStable().then(() => {
     // when
      input.nativeElement.value = 'sta';
      input.nativeElement.dispatchEvent( new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('minLength')).toBe(true);
        expect(control.errors.minLength.valid).toBeFalsy();
      });
   });
  }));

    it('Validate false when there is too many characters', async(() => {
    // given
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    let comp = fixture.componentInstance;
    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent( new Event('input'));
    fixture.detectChanges();

   fixture.whenStable().then(() => {
     // when
      input.nativeElement.value = 's1234567890123456789012345678901234567890123456789012345678901234567890';
      input.nativeElement.dispatchEvent( new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        // then
        expect(control.hasError('maxLength')).toBe(true);
        expect(control.errors.maxLength.valid).toBeFalsy();
      });
   });
  }));

});


