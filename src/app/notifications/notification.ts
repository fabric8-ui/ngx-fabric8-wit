import { NotificationAction } from './notification-action';
import { NotificationType } from './notification-type';
/*
 * A notification message containing:
 *
 * header - The header to display for the notification (optional)
 * message - The main text message of the notification
 * primaryActions Optional action to ask user to complete
 * moreActions  Optional list of other actions the user can take
 * type - The type of the notification message; 'success','info','danger', 'warning'
 */
export class Notification {

  header?: string;
  message: string;
  moreActions?: NotificationAction[];
  primaryAction?: NotificationAction;
  type: NotificationType;
}
