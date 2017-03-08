import { Context } from './context';
import { Observable } from 'rxjs';
export class Contexts {
  /**
   * An observable which pushes changes to the array of recent contexts.
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  recent: Observable<Context[]>;

  /**
   * An observable which pushes changes to the current context.
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  current: Observable<Context>;

  /**
   * An observable which pushes changes to the default context
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  default: Observable<Context>;
}
