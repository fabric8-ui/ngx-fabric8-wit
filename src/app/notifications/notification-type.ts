export class NotificationType {

  static readonly SUCCESS: NotificationType = {cssClass: 'success'} as NotificationType;
  static readonly INFO: NotificationType = {cssClass: 'info'} as NotificationType;
  static readonly DANGER: NotificationType = {cssClass: 'danger'} as NotificationType;
  static readonly WARNING: NotificationType = {cssClass: 'warning'} as NotificationType;

  cssClass: string;
}
