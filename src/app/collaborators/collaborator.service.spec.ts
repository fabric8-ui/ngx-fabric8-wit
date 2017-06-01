import { async, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseType, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection} from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from "../api/wit-api";
import { CollaboratorService } from './collaborator.service';

describe('Service: CollaboratorService', () => {

  let collaboratorService: CollaboratorService;
  let mockService: MockBackend;
  let fakeAuthService: any;
  let mockLog: any;

  beforeEach(() => {
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return true;
      }
    };
    mockLog = jasmine.createSpyObj('Logger', ['error']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Logger, useValue: mockLog
        },
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend,
                       options: BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        CollaboratorService,
        {
          provide: WIT_API_URL,
          useValue: "http://example.com"
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        UserService,
        Broadcaster
      ]
    });
  });

  beforeEach(inject(
    [CollaboratorService, MockBackend],
    (service: CollaboratorService, mock: MockBackend) => {
      collaboratorService = service;
      mockService = mock;
    }
  ));

  let responseData: User[] = [
    {
      "attributes": {
        "bio": "",
        "email": "user@gmail.com",
        "fullName": "user name",
        "imageURL": "https://www.gravatar.com/avatar/asdf.jpg",
        "url": "https://user.github.io",
        "username": "useruser"
      },
      "id": "6abd2970-9407-469d-a8ad-9e18706d732c",
      "links": {
        "self": "https://api.openshift.io/api/users/6abd2970-9407-469d-a8ad-9e18706d732c"
      },
      "type": "identities"
    }
  ];
  let response = { data: responseData, links: {} };
  let expectedResponse = cloneDeep(responseData);

  it('Get collaborators', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });
    // when
    collaboratorService.getInitialBySpaceId('1').subscribe((data: User[]) => {
      // then
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.username).toEqual(expectedResponse[0].attributes.username);
    });
  }));

  it('Get collaborators in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    collaboratorService.getInitialBySpaceId('1').subscribe((data: User[]) => {
      fail('get collaboration should be in error');
    }, // then
    error => expect(error).toEqual('some error'));
  }));

  it('Add new collaborators', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: ['id1']}),
          status: 201
        })
      ));
    });
    // when
    collaboratorService.addCollaborators('1', responseData)
      .subscribe(() => {
        // then
        expect('1').toEqual('1');
      });
  }));

  it('Add new collaborators in error', async(() => {
    // given
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    collaboratorService.addCollaborators('1', responseData)
      .subscribe(() => {
        fail('add collaboration should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));

  it('Remove collaborator', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: ['id1']}),
          status: 201
        })
      ));
    });
    // when
    collaboratorService.removeCollaborator('1', '6abd2970-9407-469d-a8ad-9e18706d732c')
      .subscribe(() => {
        // then
        expect('1').toEqual('1');
      });
  }));

  it('Remove collaborator in error', async(() => {
    // given
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    collaboratorService.removeCollaborator('1', '6abd2970-9407-469d-a8ad-9e18706d732c')
      .subscribe(() => {
        fail('remove collaboration should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));
});
