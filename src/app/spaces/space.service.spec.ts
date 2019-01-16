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

  beforeEach(() => {
    spaceService = new SpaceService(undefined, undefined, undefined, WIT_API_URL);
  });

  describe('#getSpaces', () => {
    describe('should handle error', () => {
      it('when limit set to an invalid value (-2)', () => {
        spaceService.getSpaces(-2).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when limit set to an invalid value (0)', () => {
        spaceService.getSpaces(0).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when limit set to an invalid value (null)', () => {
        spaceService.getSpaces(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    describe('should delegate to the function getSpacesDelegate', () => {
      it('when called with correct params (10)', () => {
        spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

        spaceService.getSpaces(10).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(WIT_API_URL);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=10');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct params (undefined)', () => {
        spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

        spaceService.getSpaces(undefined).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(WIT_API_URL);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called without params', () => {
        spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

        spaceService.getSpaces().subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(WIT_API_URL);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=20');
          validateReturnValues(returnValue, spaces);
        });
      });
    });
  });

  describe('#getMoreSpaces', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService.getMoreSpaces().subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
    });

    it('should delegate to function getSpacesDelegate with correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSpaces().subscribe((returnValue) => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
        validateReturnValues(returnValue, spaces);
      });
    });
  });

  describe('#getSpaceByName', () => {
    describe('should throw an error', () => {
      it('when userName is undefined', () => {
        spaceService.getSpaceByName(undefined, 'myspace').subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when userName is null', () => {
        spaceService.getSpaceByName(null, 'myspace').subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when userName is an empty string', () => {
        spaceService.getSpaceByName('', 'myspace').subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space name is undefined', () => {
        spaceService.getSpaceByName('somebody', undefined).subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space name is null', () => {
        spaceService.getSpaceByName('somebody', null).subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space name is an empty string', () => {
        spaceService.getSpaceByName('somebody', '').subscribe(
          failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    it('should make a correct GET request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.getSpaceByName('somebody@fabric8.org', 'my worksp@ce').subscribe(returnValue => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toContain(
          WIT_API_URL + 'namedspaces/somebody%40fabric8.org/my%20worksp%40ce');
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        validateReturnValues([returnValue], [spaces[0]]);
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
    describe('should throw an error', () => {
      it('when space is undefined', () => {
        spaceService.create(undefined).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space is null', () => {
        spaceService.create(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    it('should make a correct POST request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['post']);
      httpClient.post.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.create(spaces[0]).subscribe((returnValue) => {
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);

        expect(httpClient.post.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces');
        expect(httpClient.post.calls.mostRecent().args[1]).toBe(JSON.stringify({ data: spaces[0] }));
        expect(httpClient.post.calls.mostRecent().args[2].headers).toBeDefined();
        validateReturnValues([returnValue], [spaces[0]]);
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
    describe('should throw an error', () => {
      it('when space is undefined', () => {
        spaceService.update(undefined).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space is null', () => {
        spaceService.update(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    it('should make a correct PATCH request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient: any = jasmine.createSpyObj('HttpClient', ['patch']);
      httpClient.patch.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.update(spaces[0]).subscribe((returnValue) => {
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        expect(httpClient.patch.calls.mostRecent().args[0]).toBe(WIT_API_URL + 'spaces/1');
        expect(httpClient.patch.calls.mostRecent().args[1]).toBe(JSON.stringify({ data: spaces[0] }));
        expect(httpClient.patch.calls.mostRecent().args[2].headers).toBeDefined();
        validateReturnValues([returnValue], [spaces[0]]);
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
    describe('should throw an error', () => {
      it('when space is undefined', () => {
        spaceService.delete(undefined).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space is null', () => {
        spaceService.delete(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

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

    describe('should throw an error', () => {
      it('when search text is null', () => {
        spaceService.search(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page size is null', () => {
        spaceService.search('asdf', null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page size is -2', () => {
        spaceService.search('asdf', -2).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page size is 0', () => {
        spaceService.search('asdf', 0).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page number is null', () => {
        spaceService.search('asdf', 10, null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page number is -1', () => {
        spaceService.search('asdf', 10, -1).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    describe('should delegate to the function getSpacesDelegate', () => {
      beforeEach(() => {
        spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));
      });

      it('when called without parameters', () => {
        spaceService.search().subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('*');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (asdf)', () => {
        spaceService.search('asdf').subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('asdf');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (*)', () => {
        spaceService.search('*').subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('*');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (\'\')', () => {
        spaceService.search('').subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('*');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (asdf, 1)', () => {
        spaceService.search('asdf', 1).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('asdf');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('1');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (asdf, undefined, 0)', () => {
        spaceService.search('asdf', undefined, 0).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('asdf');
          expect(params.get('page[offset]')).toBe('0');
          expect(params.get('page[limit]')).toBe('20');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct parameters (asdf, 10, 7)', () => {
        spaceService.search('asdf', 10, 7).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(WIT_API_URL + 'search/spaces');
          const params: HttpParams = (spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[1];
          expect(params.get('q')).toBe('asdf');
          expect(params.get('page[offset]')).toBe('70');
          expect(params.get('page[limit]')).toBe('10');
          validateReturnValues(returnValue, spaces);
        });
      });
    });
  });

  describe('#getMoreSearchResults', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService.getMoreSearchResults().subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
    });

    it('should delegate to function getSpacesDelegate with a correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSearchResults().subscribe((returnValue) => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
        validateReturnValues(returnValue, spaces);
      });
    });
  });

  describe('#getSpacesByName', () => {
    describe('should throw an error', () => {
      it('when page size is 0', () => {
        spaceService.getSpacesByName('somebody', 0).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page number is null', () => {
        spaceService.getSpacesByName('somebody', null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when page number is -1', () => {
        spaceService.getSpacesByName('somebody', -1).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when user name is undefined', () => {
        spaceService.getSpacesByName(undefined).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when user name is null', () => {
        spaceService.getSpacesByName(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when user name is an empty string', () => {
        spaceService.getSpacesByName('').subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    describe('should delegate to function getSpacesDelegate', () => {
      beforeEach(() => {
        spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));
      });

      it('when called with correct params (somebody@fabric8.org, 10)', () => {
        spaceService.getSpacesByName('somebody@fabric8.org', 10).subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(
            WIT_API_URL + 'namedspaces/somebody%40fabric8.org');
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=10');
          validateReturnValues(returnValue, spaces);
        });
      });

      it('when called with correct params (somebody@fabric8.org)', () => {
        spaceService.getSpacesByName('somebody@fabric8.org').subscribe((returnValue) => {
          expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain(
            WIT_API_URL + 'namedspaces/somebody%40fabric8.org');
          expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toContain('page[limit]=20');
          validateReturnValues(returnValue, spaces);
        });
      });
    });
  });

  describe('#getMoreSpacesByName', () => {
    it('should throw an error when nextLink is not defined', () => {
      spaceService.getMoreSpacesByName().subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
    });

    it('should delegate to function getSpacesDelegate with a correct URL', () => {
      const nextLink = 'fake-next-link';
      spaceService['nextLink'] = nextLink;

      spyOn(spaceService as any, 'getSpacesDelegate').and.returnValue(observableOf(cloneDeep(spaces)));

      spaceService.getMoreSpacesByName().subscribe((returnValue) => {
        expect(spaceService['getSpacesDelegate']).toHaveBeenCalledTimes(1);
        expect((spaceService['getSpacesDelegate'] as any).calls.mostRecent().args[0]).toBe(nextLink);
        validateReturnValues(returnValue, spaces);
      });
    });
  });

  describe('#getSpaceById', () => {
    describe('should throw an error', () => {
      it('when space ID is undefined', () => {
        spaceService.getSpaceById(undefined).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space ID is null', () => {
        spaceService.getSpaceById(null).subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });

      it('when space ID is an empty string', () => {
        spaceService.getSpaceById('').subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
      });
    });

    it('should make a correct GET request', () => {
      let httpRes: any = jasmine.createSpy('HttpResponse');
      httpRes.data = cloneDeep(spaces[0]);

      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableOf(httpRes));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'resolveOwner').and.returnValue(observableOf(cloneDeep(spaces[0])));

      spaceService.getSpaceById('some@id').subscribe(returnValue => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toContain(WIT_API_URL + 'spaces/some%40id');
        expect(spaceService['resolveOwner']).toHaveBeenCalledTimes(1);
        validateReturnValues([returnValue], [spaces[0]]);
      });
    });

    it('should catch HTTP errors', () => {
      let httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService.getSpaceById('some@id').subscribe(failBecauseErrorIsExpected, err => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });

  describe('#getTotalCount', () => {
    it('should return the stored value', () => {
      spaceService.getTotalCount().subscribe(returnValue => {
        expect(returnValue).toBe(spaceService['totalCount']);
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

    it('should make a correct GET request when called without params', () => {
      spaceService['getSpacesDelegate'](fakeUrl).subscribe(returnValue => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toBe(fakeUrl);
        expect(spaceService['resolveOwners']).toHaveBeenCalledTimes(1);
        validateReturnValues(returnValue, spaces);
        expect(spaceService['totalCount']).toBe(2);
        expect(spaceService['nextLink']).toBe('fake-next-link');
      });
    });

    it('should make a correct GET request when called with correct params', () => {
      const params: HttpParams = new HttpParams().set('param1', 'xxx');

      spaceService['getSpacesDelegate'](fakeUrl, params).subscribe(returnValue => {
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(httpClient.get.calls.mostRecent().args[0]).toBe(fakeUrl);
        expect(spaceService['resolveOwners']).toHaveBeenCalledTimes(1);
        validateReturnValues(returnValue, spaces);
        expect(spaceService['totalCount']).toBe(2);
        expect(spaceService['nextLink']).toBe('fake-next-link');
      });
    });

    it('should catch HTTP errors', () => {
      httpClient = jasmine.createSpyObj('HttpClient', ['get']);
      httpClient.get.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(httpClient, undefined, undefined, WIT_API_URL);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['getSpacesDelegate'](fakeUrl).subscribe(failBecauseErrorIsExpected, err => {
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
      }, verifyErrorNotEmpty);
    });

    it('should wrap the error in an observable', () => {
      spaceService = new SpaceService(undefined, logger, undefined, undefined);

      spaceService['handleError']('some error').subscribe(failBecauseErrorIsExpected, verifyErrorNotEmpty);
    });
  });

  describe('#resolveOwner', () => {
    it('should set creator to null if no relationship is defined', () => {
      let testData: Space = cloneDeep(spaces[0]);
      delete testData.relationships['owned-by'].data;

      spaceService = new SpaceService(undefined, undefined, undefined, undefined);

      spaceService['resolveOwner'](testData).subscribe(failBecauseErrorIsExpected, err => {
        expect(err).toBeDefined();
        expect(testData.relationalData).toBeDefined();
        expect(testData.relationalData.creator).toBeNull();
      });
    });

    it('should set creator correctly', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableOf(cloneDeep(users[0])));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);

      spaceService['resolveOwner'](cloneDeep(spaces[0])).subscribe((returnValue) => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(1);
        expect(returnValue.relationalData).toBeDefined();
        expect(returnValue.relationalData.creator.id).toBe(users[0].id);
        expect(returnValue.relationalData.creator.type).toBe(users[0].type);
        expect(returnValue.relationalData.creator.attributes.fullName).toBe(users[0].attributes.fullName);
        expect(returnValue.relationalData.creator.attributes.imageURL).toBe(users[0].attributes.imageURL);
        expect(returnValue.relationalData.creator.attributes.username).toBe(users[0].attributes.username);
      });
    });

    it('should catch HTTP errors', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['resolveOwner'](cloneDeep(spaces[0])).subscribe(failBecauseErrorIsExpected, err => {
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

      spaceService['resolveOwners'](testData).subscribe((returnValue: Space[]) => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(2);
        expect(userService.getUserByUserId.calls.argsFor(0)[0]).toEqual(spaces[0].relationships['owned-by'].data.id);
        expect(userService.getUserByUserId.calls.argsFor(1)[0]).toEqual(spaces[1].relationships['owned-by'].data.id);
        expect(returnValue.length).toBe(3);

        for (let i = 0; i < 2; i++) {
          expect(returnValue[i].relationalData).toBeDefined();
          expect(returnValue[i].relationalData.creator.type).toBeDefined();
          expect(returnValue[i].relationalData.creator.attributes.fullName).toBeDefined();
          expect(returnValue[i].relationalData.creator.attributes.imageURL).toBeDefined();
          expect(returnValue[i].relationalData.creator.attributes.username).toBeDefined();
        }

        expect(returnValue[0].relationalData.creator.id).toBe(spaces[0].relationships['owned-by'].data.id);
        expect(returnValue[1].relationalData.creator.id).toBe(spaces[1].relationships['owned-by'].data.id);
        expect(returnValue[2].relationalData.creator.id).toBe(spaces[1].relationships['owned-by'].data.id);
      });
    });

    it('should catch HTTP errors', () => {
      let userService: any = jasmine.createSpyObj('UserService', ['getUserByUserId']);
      userService.getUserByUserId.and.returnValue(observableThrowError('some HTTP error'));

      spaceService = new SpaceService(undefined, undefined, userService, undefined);
      spyOn(spaceService as any, 'handleError').and.returnValue(observableThrowError('handled HTTP error'));

      spaceService['resolveOwners'](spaces).subscribe(failBecauseErrorIsExpected, err => {
        expect(userService.getUserByUserId).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledTimes(1);
        expect(spaceService['handleError']).toHaveBeenCalledWith('some HTTP error');
        expect(err).toBe('handled HTTP error');
      });
    });
  });
});

let validateReturnValues = (returnValues: Space[], expectedValues: Space[]) => {
  expect(returnValues.length).toBe(expectedValues.length);
  for (let i = 0; i < expectedValues.length; i++) {
    expect(returnValues[i].id).toBe(expectedValues[i].id);
    expect(returnValues[i].attributes.name).toBe(expectedValues[i].attributes.name);
    expect(returnValues[i].attributes.description).toBe(expectedValues[i].attributes.description);
  }
};

let failBecauseErrorIsExpected = () => {
  fail('An error is expected');
};

let verifyErrorNotEmpty = (err: any) => {
  expect(err).toBeDefined();
};
