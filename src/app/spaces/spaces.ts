import { Space } from './../models/space';
import { Observable } from 'rxjs';
export interface Spaces {

  /**
   * An observable which pushes changes to the current space.
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  current: Observable<Space>;
}
