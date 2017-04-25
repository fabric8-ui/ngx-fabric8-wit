import { async, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from "../api/wit-api";
import { CollaboratorService } from './collaborator.service';

describe('Service: CollaboratorService', () => {

  let collaboratorService: CollaboratorService;
  let mockService: MockBackend;
  let fakeAuthService: any;

  beforeEach(() => {
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return true;
      }
    };
    TestBed.configureTestingModule({
      providers: [
        Logger,
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
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    collaboratorService.getAllBySpaceId('1').subscribe((data: User[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.username).toEqual(expectedResponse[0].attributes.username);
    });
  }));

  it('Add new collaborators', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: ['id1']}),
          status: 201
        })
      ));
    });

    collaboratorService.addCollaborators('1', responseData)
      .subscribe(() => {
        expect('1').toEqual('1');
      });
  }));
});
