import { async, TestBed } from '@angular/core/testing';
import { UniqueSpaceNameValidatorDirective } from './unique-space-name.directive';
import { FormsModule, NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SpaceService } from './space.service';
import { UserService } from 'ngx-login-client';
import { Space } from '../models/space';
import { Observable, ConnectableObservable } from 'rxjs';

@Component({
  template: `
    <form>
      <input name="spaceName" [ngModel]="spaceName" uniqueSpaceName />
    </form>
  `
})
class TestSpaceNameComponent {
  spaceName: string;
}

describe('Directive for Name Space', () => {
  let spaceServiceSpy: any;
  let userServiceSpy: any;
  let space: Space;

  beforeEach(() => {
    spaceServiceSpy = jasmine.createSpyObj('SpaceService', ['getSpaceByName']);
    userServiceSpy = jasmine.createSpy('UserService');
    space =  {
      name: 'TestSpace',
      path: 'testspace',
      teams: [],
      defaultTeam: null,
      'attributes': {
        'name': 'TestSpace',
        description: 'This is a space for unit test',
        'created-at': null,
        'updated-at': null,
        'version': 0
      },
      'id': '1',
      'type': 'spaces',
      'links': {
        'self': 'http://example.com/api/spaces/1'
      },
      'relationships': {
        areas: {
          links: {
            related: 'http://example.com/api/spaces/1/areas'
          }
        },
        iterations: {
          links: {
            related: 'http://example.com/api/spaces/1/iterations'
          }
        },
        workitemtypegroups: {
          links: {
            related: 'http://example.com/api/spacetemplates/1/workitemtypegroups'
          }
        },
        'owned-by': {
          'data': {
            'id': '00000000-0000-0000-0000-000000000000',
            'type': 'identities'
          }
        }
      },
      relationalData: {
        creator: {
          attributes: {
            fullName: 'name',
            imageURL: 'url',
            username: 'name'
          },
          id: 'id',
          type: 'type'
        }
      }
    };
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestSpaceNameComponent, UniqueSpaceNameValidatorDirective],
      providers: [
        {provide: SpaceService, useValue: spaceServiceSpy},
        {provide: UserService, useValue: userServiceSpy}
        ]
    });
  });

  it('Validate false when 2 spaces exist with same name', async(() => {
    let user = {
      'attributes': {
        'fullName': 'name',
        'imageURL': '',
        'username': 'myUser'
      },
      'id': 'userId',
      'type': 'userType'
    };
    let fixture = TestBed.createComponent(TestSpaceNameComponent);
    userServiceSpy.loggedInUser = ConnectableObservable.of(user);
    spaceServiceSpy.getSpaceByName.and.returnValue(Observable.of(space));


    let debug = fixture.debugElement;
    let input = debug.query(By.css('input'));
    input.nativeElement.value = 'start';
    input.nativeElement.dispatchEvent( new Event('input'));
    fixture.detectChanges();

   fixture.whenStable().then(() => {
      input.nativeElement.value = 'TestSpace';
      input.nativeElement.dispatchEvent( new Event('input'));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let form: NgForm = debug.children[0].injector.get(NgForm);
        let control = form.control.get('spaceName');
        expect(control.hasError('unique')).toBe(true);
        expect(control.errors.unique.valid).toBeFalsy();
        expect(control.errors.unique.existingSpace.name).toEqual('TestSpace');
        let expectedMessage = 'The Space Name TestSpace  is already in use as name/TestSpace';
        expect(control.errors.unique.message).toEqual(expectedMessage);
      });
   });
  }));
});


