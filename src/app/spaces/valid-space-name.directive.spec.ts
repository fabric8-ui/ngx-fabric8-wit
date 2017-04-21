import { async, TestBed } from '@angular/core/testing';
import { ValidSpaceNameValidatorDirective, validSpaceNameValidator } from './valid-space-name.directive'
import { FormsModule, NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <form>
      <input name="email" [ngModel]="email" validSpaceName />
    </form>
  `
})
class TestSpaceNameComponent {
  email: string;
}

describe('Directive for Name Space - ', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestSpaceNameComponent, ValidSpaceNameValidatorDirective]
    });
  });

  it('should validate false when name starts with unsupported characters', async(() => {
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
        let control = form.control.get('email');
        // then
        expect(control.hasError('invalid')).toBe(true);
        expect(control.errors.invalid.valid).toBeFalsy();
      });
   });
  }));

  it('should validate true when underscore in the middle', async(() => {
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
        let control = form.control.get('email');
        // then
        expect(control.errors).toBeNull();
      });
   });
  }));

});
