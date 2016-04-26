var CLIENT_ID = '967574003618-9q4ee0r0ppq4hg9a2l3m7g81s7594aqp.apps.googleusercontent.com';
var SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/activity",
  "https://www.googleapis.com/auth/gmail.readonly"
];

function checkAuth() {
  gapi.auth.authorize({ 'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true }, handleAuth);
}

function handleAuth(authResult) {
  angular.element('#gafeApp').scope().model.load(authResult);
}