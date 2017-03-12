import { async, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, Logger, UserService, Broadcaster, AUTH_API_URL } from 'ngx-login-client';

import { WIT_API_URL } from "../api/wit-api";
import { Space } from '../models/space';
import { SpaceService } from './space.service';

describe('Service: SpaceService', () => {

  let spaceService: SpaceService;
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
        SpaceService,
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
    [SpaceService, MockBackend],
    (service: SpaceService, mock: MockBackend) => {
      spaceService = service;
      mockService = mock;
    }
  ));

  let responseData: Space[] = [
    {
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
        'owned-by': {
          'data': {
            'id': '00000000-0000-0000-0000-000000000000',
            'type': 'identities'
          }
        }
      }
    }
  ];
  let response = { data: responseData, links: {} };
  let expectedResponse = cloneDeep(responseData);


  it('Get spaces', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    spaceService.getSpaces().subscribe((data: Space[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
      expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
    });
  }));

  it('Add new space', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 201
        })
      ));
    });

    spaceService.create(responseData[0])
      .subscribe((data: Space) => {
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));

  it('Update a space', async(() => {
    let updatedData: Space = cloneDeep(responseData[0]);
    updatedData.attributes.description = 'Updated description';

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: updatedData}),
          status: 200
        })
      ));
    });

    spaceService.update(updatedData)
      .subscribe((data: Space) => {
        expect(data.id).toEqual(updatedData.id);
        expect(data.attributes.name).toEqual(updatedData.attributes.name);
        expect(data.attributes.description).toEqual(updatedData.attributes.description);
      });
  }));

  it('Get a single space', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });

    let userName = "testuser";

    spaceService.getSpaceByName(userName,responseData[0].attributes.name)
      .subscribe((data: Space) => {
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));

  it('Search a space by name', async(() => {
    let matchedData: Space[] = cloneDeep(responseData);

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    spaceService.search("test")
      .subscribe((data: Space[]) => {
        expect(data[0].id).toEqual(matchedData[0].id);
        expect(data[0].attributes.name).toEqual(matchedData[0].attributes.name);
        expect(data[0].attributes.description).toEqual(matchedData[0].attributes.description);
      });
  }));

  it('Get spaces by userName', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    let userName = 'testUser';

    spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
      expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
    });
  }));

  it('Get a single space by Id', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });

    let spaceId = '1';

    spaceService.getSpaceById(spaceId)
      .subscribe((data: Space) => {
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));

});
