import { InjectionToken } from '@angular/core';

/**
 * An InjectionToken which is used to inject the WIT_API_URL in to this or any other module.
 *
 * For example, in your injectable constructor:
 *
 *   Inject(WIT_API_URL) apiUrl: string
 *
 */
export let WIT_API_URL = new InjectionToken<string>('fabric8.wit.api.url');
