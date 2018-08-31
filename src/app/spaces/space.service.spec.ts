import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { async, inject, TestBed } from '@angular/core/testing';

import { cloneDeep } from 'lodash';
import {
  empty as emptyObservable,
  Observable,
  of as observableOf,
  throwError as observableThrowError
} from 'rxjs';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';
import { SpaceService } from './space.service';

describe('Service: SpaceService', () => {

  let spaceService: SpaceService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeAuthService: any;
  let fakeUserService: any;
  let mockLog: any;

  beforeEach(() => {
    mockLog = jasmine.createSpyObj('Logger', ['error']);
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return true;
      }
    };
    const getUserByUserId: jasmine.Spy = jasmine.createSpy('UserService.getUserByUserId');
    getUserByUserId.and.returnValue(emptyObservable());
    fakeUserService = { getUserByUserId };
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: Logger, useValue: mockLog
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        {
          provide: UserService,
          useValue: fakeUserService
        },
        SpaceService,
        {
          provide: WIT_API_URL,
          useValue: 'http://example.com/'
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        Broadcaster
      ]
    }).compileComponents();

    spaceService = TestBed.get(SpaceService);

    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

  });

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
      }
    }
  ];
  let response = { data: responseData, links: {}, meta: {} };
  let expectedResponse = cloneDeep(responseData);

  // for odd characters
  let responseDataWithSlash: Space[] = [
    {
      name: 'Test/Space',
      path: 'test/space',
      teams: [],
      defaultTeam: null,
      'attributes': {
        'name': 'Test/Space',
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
      }
    }
  ];

  describe('#getSpaces', () => {
    it('should get spaces', (() => {
      spaceService.getSpaces().subscribe((data: Space[]) => {
        expect(data[0].id).toEqual(expectedResponse[0].id);
        expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
    }));
  });

  describe('#create', () => {
    it('Add new space', async(() => {
      spaceService.create(responseData[0])
        .subscribe((data: Space) => {
          expect(data.id).toEqual(expectedResponse[0].id);
          expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
          expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
        });
    }));
  });

  describe('#update', () => {
    it('Update a space', async(() => {
      let updatedData: Space = cloneDeep(responseData[0]);
      updatedData.attributes.description = 'Updated description';

      spaceService.update(updatedData)
        .subscribe((data: Space) => {
          expect(data.id).toEqual(updatedData.id);
          expect(data.attributes.name).toEqual(updatedData.attributes.name);
          expect(data.attributes.description).toEqual(updatedData.attributes.description);
        });
    }));
  });

  describe('#getSpaceByName', () => {
    it('should get a single space by name', async(() => {
      let userName = 'testuser';
      spaceService.getSpaceByName(userName, responseData[0].attributes.name)
        .subscribe((data: Space) => {
          expect(data.id).toEqual(expectedResponse[0].id);
          expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
          expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
        });
    }));

    it('should get a single space by name with plus, space and slash character in the name', async(() => {
      let userName = 'test+us er';
      spaceService.getSpaceByName(userName, responseDataWithSlash[0].attributes.name)
        .subscribe((data: Space) => {
          expect(data.id).toEqual(expectedResponse[0].id);
          expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
        });
    }));
  });

  describe('#search', () => {
    it('should search a space by name', async(() => {
      const users: User[] = [
        {
          id: 'fooId',
          attributes: {
            username: 'userA'
          }
        } as User,
        {
          id: 'barId',
          attributes: {
            username: 'userB'
          }
        } as User
      ];
      const userService: { getUserByUserId: jasmine.Spy } = TestBed.get(UserService);
      userService.getUserByUserId.and.callFake((id: string): Observable<User> => {
        if (id === 'fooId') {
          return observableOf(users[0]);
        } else if (id === 'barId') {
          return observableOf(users[1]);
        } else {
          return observableThrowError('unknown userId');
        }
      });
      const resp: Space[] = [
        {
          name: 'TestSpace1',
          path: 'testspace1',
          teams: [],
          defaultTeam: null,
          'attributes': {
            'name': 'TestSpace1',
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
                'id': 'fooId',
                'type': 'identities'
              }
            }
          }
        },
        {
          name: 'TestSpace2',
          path: 'testspace2',
          teams: [],
          defaultTeam: null,
          'attributes': {
            'name': 'TestSpace2',
            description: 'This is a space for unit test',
            'created-at': null,
            'updated-at': null,
            'version': 0
          },
          'id': '2',
          'type': 'spaces',
          'links': {
            'self': 'http://example.com/api/spaces/2'
          },
          'relationships': {
            areas: {
              links: {
                related: 'http://example.com/api/spaces/2/areas'
              }
            },
            iterations: {
              links: {
                related: 'http://example.com/api/spaces/2/iterations'
              }
            },
            workitemtypegroups: {
              links: {
                related: 'http://example.com/api/spacetemplates/2/workitemtypegroups'
              }
            },
            'owned-by': {
              'data': {
                'id': 'barId',
                'type': 'identities'
              }
            }
          }
        }
      ];

      // mockService.connections.subscribe((connection: any) => {
      //   connection.mockRespond(new Response(
      //     new ResponseOptions({
      //       body: JSON.stringify({
      //         data: resp,
      //         links: {
      //           next: 'https://example.com/api/search/spaces?page[offset]=20\u0026page[limit]=20\u0026q=test'
      //         },
      //         meta: {
      //           totalCount: 5
      //         }
      //       }),
      //       status: 200
      //     })
      //   ));
      // });

      spaceService.search('test')
        .subscribe((data: Space[]) => {
          expect(data[0].id).toEqual(resp[0].id);
          expect(data[0].attributes.name).toEqual(resp[0].attributes.name);
          expect(data[0].attributes.description).toEqual(resp[0].attributes.description);
          expect(data[0].relationalData.creator).toEqual(users[0]);

          expect(data[1].id).toEqual(resp[1].id);
          expect(data[1].attributes.name).toEqual(resp[1].attributes.name);
          expect(data[1].attributes.description).toEqual(resp[1].attributes.description);
          expect(data[1].relationalData.creator).toEqual(users[1]);
        });

      // spaceService.getTotalCount()
      //   .subscribe((totalCount: number) => {
      //     expect(totalCount).toEqual(5);
      //   });
    }));

    describe('Search by name with pagination', () => {
      it('should default to first page with page size of 20', async(() => {
        let matchedData: Space[] = cloneDeep(responseData);
        // let resp: any = cloneDeep(response);
        // resp.meta['totalCount'] = 40;
        //
        // mockService.connections.subscribe((connection: MockConnection) => {
        //   expect(connection.request.url)
        //     .toEqual('http://example.com/search/spaces?q=test&page%5Boffset%5D=0&page%5Blimit%5D=20');
        //   connection.mockRespond(new Response(
        //     new ResponseOptions({
        //       body: JSON.stringify(resp),
        //       status: 200
        //     })
        //   ));
        // });

        spaceService.search('test')
          .subscribe((data: Space[]) => {
            expect(data[0].id).toEqual(matchedData[0].id);
            expect(data[0].attributes.name).toEqual(matchedData[0].attributes.name);
            expect(data[0].attributes.description).toEqual(matchedData[0].attributes.description);
          });
      }));

      it('should default to first page and allow specified page size', async(() => {
        let matchedData: Space[] = cloneDeep(responseData);

        spaceService.search('test', 10)
          .subscribe((data: Space[]) => {
            expect(data[0].id).toEqual(matchedData[0].id);
            expect(data[0].attributes.name).toEqual(matchedData[0].attributes.name);
            expect(data[0].attributes.description).toEqual(matchedData[0].attributes.description);
          });
      }));

      it('should offset correctly', async(() => {
        let matchedData: Space[] = cloneDeep(responseData);

        spaceService.search('test', 2, 8)
          .subscribe((data: Space[]) => {
            expect(data[0].id).toEqual(matchedData[0].id);
            expect(data[0].attributes.name).toEqual(matchedData[0].attributes.name);
            expect(data[0].attributes.description).toEqual(matchedData[0].attributes.description);
          });
      }));
    });
  });

  describe('#getSpacesByUser', () => {
    it('should get spaces by userName', async(() => {
      let userName = 'testUser';

      spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
        expect(data[0].id).toEqual(expectedResponse[0].id);
        expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
    }));

    it('should get spaces by userName with a plus in the username', async(() => {
      let userName = 'test+User';

      spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
        expect(data[0].id).toEqual(expectedResponse[0].id);
        expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
    }));
  });

  describe('#getSpaceById', () => {
    it('should get a single space by Id', async(() => {
      let spaceId = '1';

      spaceService.getSpaceById(spaceId)
        .subscribe((data: Space) => {
          expect(data.id).toEqual(expectedResponse[0].id);
          expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
          expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
        });
    }));
  });

  describe('#deleteSpace', () => {
    // it('should not skip cluster when deleting by default', async(() => {
    //   mockService.connections.subscribe((connection: MockConnection) => {
    //     let expectedUrl: string = 'http://example.com/spaces/mock-space-id?skipCluster=false';
    //     expect(connection.request.url).toEqual(expectedUrl);
    //     connection.mockRespond(new Response(new ResponseOptions({})));
    //   });
    //
    //   let mockSpace = {id: 'mock-space-id'} as Space;
    //   spaceService.deleteSpace(mockSpace);
    // }));
    //
    // it('should skip cluster when deleting with true', async(() => {
    //   mockService.connections.subscribe((connection: MockConnection) => {
    //     let expectedUrl: string = 'http://example.com/spaces/mock-space-id?skipCluster=true';
    //     expect(connection.request.url).toEqual(expectedUrl);
    //     connection.mockRespond(new Response(new ResponseOptions({})));
    //   });
    //
    //   let mockSpace = {id: 'mock-space-id'} as Space;
    //   spaceService.deleteSpace(mockSpace, true);
    // }));
  });

});

let getreal = {
  "data": {
    "attributes": {
      "created-at": "2018-06-25T14:50:58.057465Z",
      "description": "The Agile Scrum working space for the OpenShift.io team.",
      "name": "Openshift_io",
      "updated-at": "2018-07-16T12:37:57.196893Z",
      "version": 1
    },
    "id": "e8864cfe-f65a-4351-85a4-3a585d801b45",
    "links": {
      "backlog": {
        "meta": {"totalCount": 200},
        "self": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/backlog"
      },
      "filters": "https://openshift.io/api/filters",
      "related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45",
      "self": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45",
      "workitemlinktypes": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418/workitemlinktypes",
      "workitemtypes": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418/workitemtypes"
    },
    "relationships": {
      "areas": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/areas"}},
      "backlog": {
        "links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/backlog"},
        "meta": {"totalCount": 200}
      },
      "codebases": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/codebases"}},
      "collaborators": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/collaborators"}},
      "filters": {"links": {"related": "https://openshift.io/api/filters"}},
      "iterations": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/iterations"}},
      "labels": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/labels"}},
      "owned-by": {
        "data": {"id": "7b50ddb4-5e12-4031-bca7-3b88f92e2339", "type": "identities"},
        "links": {"related": "https://openshift.io/api/users/7b50ddb4-5e12-4031-bca7-3b88f92e2339"}
      },
      "space-template": {
        "data": {"id": "f405fa41-a8bb-46db-8800-2dbe13da1418", "type": "spacetemplates"},
        "links": {
          "related": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418",
          "self": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418"
        }
      },
      "workitemlinktypes": {"links": {"related": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418/workitemlinktypes"}},
      "workitems": {"links": {"related": "https://openshift.io/api/spaces/e8864cfe-f65a-4351-85a4-3a585d801b45/workitems"}},
      "workitemtypegroups": {"links": {"related": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418/workitemtypegroups"}},
      "workitemtypes": {"links": {"related": "https://openshift.io/api/spacetemplates/f405fa41-a8bb-46db-8800-2dbe13da1418/workitemtypes"}}
    },
    "type": "spaces"
  }
};
