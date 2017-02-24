# ngx-fabric8-wit
Common services for working with the Fabric8 Work Item Tracker

The work item tracker is located [here](https://github.com/almighty/almighty-core). 
You can see how it is used in the front-end [here](https://github.com/fabric8io/fabric8-ui).

The system we build is composed of several components existing in separate repos but
still needing access to common information, like who is logged. These services were 
extracted to provide a shared set of services. 

## Getting started:

This library does not run on it's own. It must be imported. 

`npm install ngx-fabric8-wit`

There are several services and a couple of models used by them available.

    Space Service
  
You must provide the URL to API to do the login. To do this, you must provide 
a `string` with an OpaqueToken `WIT_API_URL` from `ngx-fabric8-wit`. We suggest using a
factory provider for this. For example:

````
import { ApiLocatorService } from './api-locator.service';
import { WIT_API_URL } from 'ngx-fabric8-wit';

let authApiUrlFactory = (api: ApiLocatorService) => {
  return api.witApiUrl;
};

export let witApiUrlProvider = {
  provide: WIT_API_URL,
  useFactory: witApiUrlFactory,
  deps: [ApiLocatorService]
};
````

NOTE: `ApiLocatorService` is a service that we use to construct API URLs using patterns determined
by our application architecture, you can implement this part however you like.

Finally you need to register `witApiUrlProvider` with a module or a component.
 

## Building it 
 
#### Install the dependencies:
 
 `npm install`
 
#### If you need to update the dependencies you can reinstall:
 
 `npm run reinstall`
 
#### Run the tests:
 
 `npm test`
 
#### Build the library:
 
 `npm run build`
 
#### Try it out locally. 
 
 We found that `npm link` doesn't fully work. You have to reference the library via `file:`. But you still need to create the link.
 
 - Start by running:
 
   `npm link dist`
 
 - Change this:
 
   `"ngx-fabric8-wit": "X.X.X"`
   
 - to this:
 
   `"ngx-fabric8-wit": "file:/[LOCATION-TO-NODE-MODULES]/.nvm/versions/node/v6.9.1/lib/node_modules/ngx-fabric8-wit"`
 
 
#### To publish it to NPM:
 
 `npm publish dist/`  
(_we don't want to publish the whole repo, just the built parts_)


## Continuous Delivery & Semantic Relases

In ngx-fabric8-wit we use the [semantic-release plugin](https://github.com/semantic-release/semantic-release). That means 
that all you have to do is use the [AngularJS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit)
and send a pull request. Once the PR is merged, a new release will be automatically published to npmjs.com.

