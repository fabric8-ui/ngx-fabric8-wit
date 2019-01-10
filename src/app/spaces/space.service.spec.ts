import { HttpParams } from '@angular/common/http';
import { cloneDeep } from 'lodash';
import {
  of as observableOf,
  throwError as observableThrowError
} from 'rxjs';
import { User } from 'ngx-login-client';

import { Space } from '../models/space';
import { SpaceService } from './space.service';

describe('Service: SpaceService', () => {
  let spaceService: SpaceService;
  const WIT_API_URL = 'https://example.com/';

  const users: User[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      type: 'identities',
      attributes: {
        fullName: 'John Test 1',
        imageURL: 'fake-url1',
        username: 'johntest1'
      }
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      type: 'identities',
      attributes: {
        fullName: 'John Test 2',
        imageURL: 'fake-url2',
        username: 'johntest2'
      }
    }];

  let spaces: Space[] = [
    {
      name: 'TestSpace1',
      path: 'testspace1',
      teams: [],
      defaultTeam: null,
      attributes: {
        name: 'TestSpace1',
        description: 'This is a space 1 for unit test',
        'created-at': null,
        'updated-at': null,
        version: 0
      },
      id: '1',
      type: 'spaces',
      links: {
        self: 'http://example.com/api/spaces/1'
      },
      relationships: {
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
            related:
              'http://example.com/api/spacetemplates/1/workitemtypegroups'
          }
        },
        'owned-by': {
          data: {
            id: '00000000-0000-0000-0000-000000000001',
            type: 'identities'
          }
        }
      }
    },
    {
      name: 'TestSpace2',
      path: 'testspace2',
      teams: [],
      defaultTeam: null,
      attributes: {
        name: 'TestSpace2',
        description: 'This is a space 2 for unit test',
        'created-at': null,
        'updated-at': null,
        version: 0
      },
      id: '2',
      type: 'spaces',
      links: {
        self: 'http://example.com/api/spaces/2'
      },
      relationships: {
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
            related:
              'http://example.com/api/spacetemplates/2/workitemtypegroups'
          }
        },
        'owned-by': {
          data: {
            id: '00000000-0000-0000-0000-000000000002',
            type: 'identities'
          }
        }
      }
    }
  ];

  describe('#getSpaces', () => {
    it('should handle error when limit set to an invalid value', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpaces(-2).subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should delegate to function getSpacesDelegate with correct params', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getSpaces(10).subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=10');
      });
    });
  });

  describe('#getMoreSpaces', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getMoreSpaces().subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should delegate to function getSpacesDelegate with correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSpaces().subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
      });
    });
  });

  describe('#getSpaceByName', () => {
    it('should throw an error when userName is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpaceByName(undefined, 'myspace').subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should throw an error when space name is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpaceByName('somebody', undefined).subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should make a correct GET request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.getSpaceByName('somebody@fabric8.org', 'my worksp@ce').subscribe(data => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toContain(
          WIT_API_URL + 'namedspaces/somebody%40fabric8.org/my%20worksp%40ce');
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        expect(data.id).toBe(spaces[0].id);
        expect(data.attributes.name).toBe(spaces[0].attributes.name);
        expect(data.attributes.description).toBe(spaces[0].attributes.description);
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.getSpaceByName('somebody@fabric8.org', 'my worksp@ce').subscribe(() => { }, err => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#create', () => {
    it('should make a correct POST request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['post']);
      httpClient.post.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.create(spaces[0]).subscribe(() => {
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);

        expect(httpClient.post.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces');
        expect(httpClient.post.calls.mostRecent().args[1]).toBe(JSON.stringify({ data: spaces[0] }));
        expect(httpClient.post.calls.mostRecent().args[2].headers).toBeDefined();
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['post']);
      httpClient.post.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.create(cloneDeep(spaces[0])).subscribe(() => { }, err => {
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#update', () => {
    it('should make a correct PATCH request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['patch']);
      httpClient.patch.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.update(spaces[0]).subscribe(() => {
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        expect(httpClient.patch.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces/1');
        expect(httpClient.patch.calls.mostRecent().args[1]).toBe(JSON.stringify({ data: spaces[0] }));
        expect(httpClient.patch.calls.mostRecent().args[2].headers).toBeDefined();
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['patch']);
      httpClient.patch.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.update(spaces[0]).subscribe(() => { }, err => {
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#delete', () => {
    it('should make a correct DELETE request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['delete']);
      httpClient.delete.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);

      spaceService.delete(spaces[0]).subscribe(() => {
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        expect(httpClient.delete.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces/1');
        expect(httpClient.delete.calls.mostRecent().args[1].headers).toBeDefined();
        expect(httpClient.delete.calls.mostRecent().args[1].params.get('skipCluster')).toBe('false');
      });
    });

    it('should set skipCluster correctly in DELETE request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['delete']);
      httpClient.delete.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);

      spaceService.delete(spaces[0], true).subscribe(() => {
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        expect(httpClient.delete.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces/1');
        expect(httpClient.delete.calls.mostRecent().args[1].headers).toBeDefined();
        expect(httpClient.delete.calls.mostRecent().args[1].params.get('skipCluster')).toBe('true');
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['delete']);
      httpClient.delete.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.delete(spaces[0]).subscribe(() => { }, err => {
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#search', () => {
    it('should delegate to function getSpacesDelegate with correct parameters', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, WIT_API_URL);

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.search('asdf', 10, 7).subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
        const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
        expect(params.get('q')).toBe('asdf');
        expect(params.get('page[offset]')).toBe('70');
        expect(params.get('page[limit]')).toBe('10');
      });
    });

    it('should delegate to function getSpacesDelegate with correct parameters when search text is empty', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, WIT_API_URL);

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.search('', 10, 7).subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
        const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
        expect(params.get('q')).toBe('*');
        expect(params.get('page[offset]')).toBe('70');
        expect(params.get('page[limit]')).toBe('10');
      });
    });
  });

  describe('#getMoreSearchResults', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getMoreSearchResults().subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should delegate to function getSpacesDelegate with a correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSearchResults().subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
      });
    });
  });

  describe('#getSpacesByName', () => {
    it('should handle error when limit set to an invalid value', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpacesByName('somebody', -2).subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should handle error when user name is empty', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpacesByName('').subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should delegate to function getSpacesDelegate with correct params', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getSpacesByName('somebody@fabric8.org', 10).subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(
          WIT_API_URL + 'namedspaces/somebody%40fabric8.org');
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=10');
      });
    });
  });

  describe('#getMoreSpacesByName', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getMoreSpacesByName().subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should delegate to function getSpacesDelegate with a correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSpacesByName().subscribe(() => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
      });
    });
  });

  describe('#getSpaceById', () => {
    it('should throw an error when spaceId is not defined', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getSpaceById(undefined).subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should make a correct GET request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.getSpaceById('some@id').subscribe(data => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toContain(WIT_API_URL + 'spaces/some%40id');
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        expect(data.id).toBe(spaces[0].id);
        expect(data.attributes.name).toBe(spaces[0].attributes.name);
        expect(data.attributes.description).toBe(spaces[0].attributes.description);
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.getSpaceById('some@id').subscribe(() => { }, err => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#getTotalCount', () => {
    it('should return the stored value', () => {
      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService.getTotalCount().subscribe(value => {
        expect(value).toBe(spaceService['totalCount']);
      });
    });
  });

  describe('#getSpacesDelegate', () => {
    let httpRes: any;
    let httpClient: any;
    let fakeUrl = WIT_API_URL + 'fake';

    beforeEach(() => {
      httpRes = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces);
      httpRes.meta = { totalCount: 2 };
      httpRes.links = { next: 'fake-next-link' };

      httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwners').and.returnValue(observableOf(cloneDeep(spaces)));
    });

    it('should make a correct GET request without params', () => {
      spaceService['getSpacesDelegate'](fakeUrl).subscribe(data => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toBe(fakeUrl);
        expect(spaceService['resolveOwners']).toHaveBeenCalledTimes(1);
        expect(data.length).toBe(2);
        for (let i = 0; i < 2; i++) {
          expect(data[i].id).toBe(spaces[i].id);
          expect(data[i].attributes.name).toBe(spaces[i].attributes.name);
          expect(data[i].attributes.description).toBe(spaces[i].attributes.description);
        }
        expect(spaceService['totalCount']).toBe(2);
        expect(spaceService['nextLink']).toBe('fake-next-link');
      });
    });

    it('should make a correct GET request with params', () => {
      const params: HttpParams = new HttpParams().set('param1', 'xxx');

      spaceService['getSpacesDelegate'](fakeUrl, params).subscribe(data => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toBe(fakeUrl);
        expect(spaceService['resolveOwners']).toHaveBeenCalledTimes(1);
        expect(data.length).toBe(2);
        for (let i = 0; i < 2; i++) {
          expect(data[i].id).toBe(spaces[i].id);
          expect(data[i].attributes.name).toBe(spaces[i].attributes.name);
          expect(data[i].attributes.description).toBe(spaces[i].attributes.description);
        }
        expect(spaceService['totalCount']).toBe(2);
        expect(spaceService['nextLink']).toBe('fake-next-link');
      });
    });

    it('should catch HTTP errors', () => {
      httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['getSpacesDelegate'](fakeUrl).subscribe(() => { }, err => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#handleError', () => {
    let logger = jasmine.createSpyObj('Logger', ['error']);

    it('should log the error', () => {
      spaceService = new SpaceService(undefined, logger, undefined, undefined);

      spaceService['handleError']('some error').subscribe(() => {
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error.calls.mostRecent().args[0]).toBe('some error');
      }, err => {
        expect(err).toBeDefined();
      });
    });

    it('should wrap the error in an observable', () => {
      spaceService = new SpaceService(undefined, logger, undefined, undefined);

      spaceService['handleError']('some error').subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBe('some error');
      });
    });
  });

  describe('#resolveOwner', () => {
    it('should set creator to null if no relationship is defined', () => {
      let testData: Space = cloneDeep(spaces[0]);
      delete testData.relationships['owned-by'].data;

      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService['resolveOwner'](testData).subscribe(() => {
        fail('An error is expected');
      }, err => {
        expect(err).toBeDefined();
        expect(testData.relationalData).toBeDefined();
        expect(testData.relationalData.creator).toBeNull();
      });
    });

    it('should set creator correctly', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableOf(cloneDeep(users[0])));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);

      spaceService['resolveOwner'](cloneDeep(spaces[0])).subscribe((value: Space) => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(1);
        expect(value.relationalData).toBeDefined();
        expect(value.relationalData.creator.id).toBe(users[0].id);
        expect(value.relationalData.creator.type).toBe(users[0].type);
        expect(value.relationalData.creator.attributes.fullName).toBe(users[0].attributes.fullName);
        expect(value.relationalData.creator.attributes.imageURL).toBe(users[0].attributes.imageURL);
        expect(value.relationalData.creator.attributes.username).toBe(users[0].attributes.username);
      });
    });

    it('should catch HTTP errors', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['resolveOwner'](cloneDeep(spaces[0])).subscribe(() => { }, err => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#resolveOwners', () => {
    it('should set creators correctly', () => {
      const testData: Space[] = cloneDeep(spaces);
      testData.push(cloneDeep(spaces[1]));
      testData[2].id = '3';
      testData[2].name = 'TestSpace3';

      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValues(
        observableOf(cloneDeep(users[0])),
        observableOf(cloneDeep(users[1]))
      );

      spaceService = new SpaceService(undefined, undefined, userService, undefined);

      spaceService['resolveOwners'](testData).subscribe((value: Space[]) => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(2);
        expect(userService.getUserByUserId.calls.argsFor(0)[0]).toEqual(spaces[0].relationships['owned-by'].data.id);
        expect(userService.getUserByUserId.calls.argsFor(1)[0]).toEqual(spaces[1].relationships['owned-by'].data.id);
        expect(value.length).toBe(3);

        for (let i = 0; i < 2; i++) {
          expect(value[i].relationalData).toBeDefined();
          expect(value[i].relationalData.creator.type).toBeDefined();
          expect(value[i].relationalData.creator.attributes.fullName).toBeDefined();
          expect(value[i].relationalData.creator.attributes.imageURL).toBeDefined();
          expect(value[i].relationalData.creator.attributes.username).toBeDefined();
        }

        expect(value[0].relationalData.creator.id).toBe(spaces[0].relationships['owned-by'].data.id);
        expect(value[1].relationalData.creator.id).toBe(spaces[1].relationships['owned-by'].data.id);
        expect(value[2].relationalData.creator.id).toBe(spaces[1].relationships['owned-by'].data.id);
      });
    });

    it('should catch HTTP errors', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['resolveOwners'](spaces).subscribe(() => { }, err => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });
});
