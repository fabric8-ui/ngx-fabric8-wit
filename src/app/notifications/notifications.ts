import { NotificationAction } from './notification-action';
import { Notification } from './notification';
import { Observable } from 'rxjs';
export class Notifications {

  message(notification: Notification): Observable<NotificationAction> {
    throw new Error('Unimplemented');
  }

}
