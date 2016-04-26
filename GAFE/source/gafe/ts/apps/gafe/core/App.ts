/// <reference path="../reference.ts" />
angular.module("gafeApp", ["ngMaterial", "LocalStorageModule"])
  .controller("gafeMainController", GAFE.MainController)
  .service("gafeUserService", GAFE.UserService)
  .service("gafeDriveService", GAFE.DriveService)
  .service("gafeCalendarService", GAFE.CalendarService)
  .service("gafeMailService", GAFE.MailService)
  .service("gafeActivityService", GAFE.ActivityService);