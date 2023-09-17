const emailFirestore = "firebase-test@asana-task-apps-script.iam.gserviceaccount.com";
const keyFirestore = "";
const projectIDFirestore = "asana-task-apps-script";
const firestore = FirestoreApp.getFirestore(emailFirestore, keyFirestore, projectIDFirestore)

var CLIENT_ID = ''; // Replace with your client ID
var CLIENT_SECRET = ''; // Replace with your client secret
var DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

var name;
var uni;
var binStation;
var residenceHall;
var dollyNumber;
var classStatus;
var email;
var fileId; //IMAGE FILE ID

function addTest() {
    const form = FormApp.getActiveForm(),
    formResponses = form.getResponses(),
    len = form.getResponses().length-1,
    latestFR = formResponses[len];
    const itemResponses = latestFR.getItemResponses();
    var data = {}
    data.binStation = itemResponses[0].getResponse();
    data.name = itemResponses[1].getResponse();
    data.uni = latestFR.getRespondentEmail().split("@")[0].toLowerCase();
    data.residenceHall = itemResponses[2].getResponse();
    data.dollyNumber = itemResponses[3].getResponse();
    data.classStatus = itemResponses[4].getResponse();
    data.email = latestFR.getRespondentEmail();
    firestore.updateDocument("test/test", data, true);
}

function createAsanaTask(e) {
  addTest();
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var respondentEmail = formResponse.getRespondentEmail();

  var residenceHallOptions = {
  'East Campus': '1204641609699505',
  'Hogan': '1204641609699506',
  'Woodbridge': '1204641609699507',
  'Broadway': '1204641609699508',
  'River': '1204641609699509',
  'Schapiro': '1204641609699510',
  'Ruggles': '1204641609699511',
  'Watt': '1204641609699512',
  'Wien': '1204641609699513',
  '600 West 113th Street': '1204641609699514',
  '47 Claremont': '1204641609699515',
  'Carlton Arms': '1204641609699516',
  'Harmony': '1204641609699517',
  '627 West 115th Street': '1204641609699518',
  'John Jay': '1204641609699519',
  'Carman': '1204641609699520',
  'Hartley': '1204641609699521',
  'Furnald': '1204641609699522',
  'McBain': '1204641609699523',
  'Wallach': '1204641609699524',
  '523 West 113th Street: Sigma Chi': '1204641609699525',
  '550 West 113th Street: Sigma Phi Epsilon': '1204641609699526',
  '552 West 113th Street: Delta Gamma': '1204641609699527',
  '556 West 113th Street: Sigma Nu': '1204641609699528',
  '534 West 114th Street: Kappa Alpha Theta': '1204641609699529',
  '536 West 114th Street: Alpha Chi Omega': '1204641609699530',
  '540 West 114th Street: Sigma Delta Tau': '1204641609699531',
  '548 West 114th Street: Kappa Delta Rho': '1204641609699532',
  '554 West 114th Street: Intercultural House (ICH)': '1204641609699533',
  '604 West 114th Street: Greenborough': '1204641609699534',
  '606 West 114th Street: Potluck House': '1204641610379963',
  '531 West 113th Street: Indigihouse': '1204641610379964',
  '538 West 114th Street: Pan African House': '1204641610379965',
  '542 West 114th Street: Casa Latina': '1204641610379966',
  '546 West 114th Street: Q House': '1204641610379967',
  '552 West 114th Street: Intercultural Resource Center (IRC)': '1204641610379968',
  '619 West 113th Street': '1204641610379969'
  };

  var classStatusOptions = {
    'Freshman': '1204641502664055',
    'Sophomore': '1204641502664056',
    'Junior': '1204641502664057',
    'Senior': '1204641502664058'
  };

  var binCheckOutStationOptions = {
    'Hartley Lounge': '1204641478250122',
    'East Campus Lounge': '1204641478250123',
    'Schapiro Lounge': '1204641478250124'
  };

  firestore.getDocuments('test').forEach(function (data_) {
    function addField(prop) {
      return prop ? prop : 'null'
    }
    name = addField(data_.fields.name.stringValue);
    uni = addField(data_.fields.uni.stringValue);
    binStation = addField(data_.fields.binStation.stringValue);
    residenceHall = addField(data_.fields.residenceHall.stringValue);
    dollyNumber = addField(data_.fields.dollyNumber.stringValue);
    classStatus = addField(data_.fields.classStatus.stringValue);
    email = addField(data_.fields.email.stringValue);
  });
  
  var task = {
    'data': {
      'name': 'Placeholder', //Name will get changed later
      'projects': ['1204641478250112'], // Replace with your project ID
      'due_at': new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      'custom_fields': {
        '1204641478250115': dollyNumber, // Dolly Number
        '1204641478250117': name, // Name
        '1204641478250119': uni, // Student UNI
        '1204641609699504': residenceHallOptions[residenceHall], // Current Residence Hall
        '1204641502664054': classStatusOptions[classStatus], // Current Class Status
        '1204641478250121': binCheckOutStationOptions[binStation],  // Bin Check Out Station
        '1204800731885544': '1204800731885545',  // Bin Status set to "Bin Checked-Out [Time Not Expired]"
      }
    }
  };


  // Check if a task with the same UNI already exists
  var options = {
    'method' : 'get',
    'headers': {
      'Authorization': '',
      'Content-Type': 'application/json'
    }
  };

  var response = UrlFetchApp.fetch('https://app.asana.com/api/1.0/projects/1204641478250112/tasks?opt_fields=name,custom_fields,due_at', options);
  var tasks = JSON.parse(response.getContentText()).data;
  var taskFound = false;
  var binNum, binStat, oldUni;
  var binReturnDeadline;
  var confirm;

  for (var i = 0; i < tasks.length; i++) {
    confirm = 0;
    binReturnDeadline = new Date(tasks[i].due_at).toLocaleString();
    tasks[i].custom_fields.forEach(function(field) {
      if (field.gid == '1204641478250115') {
        confirm += 1;
        binNum = field.display_value;
      } else if (field.gid == '1204641478250121') {
        confirm += 1;
        binStat = field.display_value;
      } else if (field.gid == '1204641478250119') {
        confirm += 1;
        oldUni = field.display_value;
      };
    });
    
    if(oldUni == uni && confirm == 3) {
      taskFound = true;
        // Send an error email to the user
        MailApp.sendEmail({
          to: respondentEmail,
          subject: 'Bin Check-Out Error',
          body: 'Our records indicate that you have already checked out the following bin:' + '\n' + 
          'Bin # ' + binNum + '\n' +
          'Bin Return Deadline: ' + binReturnDeadline + '\n' +
          'Bin Station: ' + binStat + '\n' + ' \n' +
          'You are allowed to check out only one bin at a time.' + '\n' + 
          'If you believe that this is an error, please speak to a Housing Staff Member at the Hartley Hospitality Desk.'
        });
        return;
      }
  }
  
  for (var i = 0; i < itemResponses.length; i++) {
    var question = itemResponses[i].getItem().getTitle();
    var answer = itemResponses[i].getResponse();

    switch(question) {
      case 'Please upload a picture of your State ID or Passport:':
        fileId = answer; // use the answer directly as the file ID
        break;
    }
  }

  if (!taskFound) {
    task.data.name = "FY24 Bin Check-Out | UNI: " + uni + " | Dolly #" + dollyNumber + " | Bin Station: " + binStation + " | Residence Hall: " + residenceHall;

    var options = {
      'method' : 'post',
      'headers': {
        'Authorization': '',
        'Content-Type': 'application/json'
      },
      'payload' : JSON.stringify(task)
    };

    var response = UrlFetchApp.fetch('https://app.asana.com/api/1.0/tasks', options);
    var taskId = JSON.parse(response.getContentText()).data.gid; // get the task ID from the response
    uploadFileToDrive(fileId, taskId);

    // Send an email to the user
    MailApp.sendEmail({
      to: respondentEmail,
      subject: 'Bin Check-Out Confirmation Receipt',
      body: 'Full Name: ' + name + '\n' + 
            'UNI: ' + uni + '\n' + 
            'Bin/Dolly #' + dollyNumber + '\n' +
            'Bin Return Deadline: ' + new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString() + '\n' +
            'Bin Station: ' + binStation + '\n' + 
            'Current Residence Hall: ' + residenceHall + '\n' + 
            ' ' + '\n' + 
            '----------------------------' + '\n' + 
            'Usage Policy: ' + '\n' +
            '-> There are two types of bins: ' + '\n' + 
            '   1. Cardboard Box + Dolly' + '\n' + 
            '   2. Blue Bin' + '\n' + 
            '-> All bins must be returned within two hours of being checked out.' + '\n' +  
            '-> You may not check out more than one bin at a time.' + '\n' + 
            '-> Bins that are not returned will be assessed a fee of $250.' + '\n' + 
            '   -> This fee also applies if the Cardboard Box or Dolly are not returned together.' + '\n' + 
            '-> All bins must be returned to the same station as the check out station.' + '\n' + 
            '-> You must fill out the bin return form to confirm that the bin has been returned.'
    });
  }
}

function getDriveService() {
  return OAuth2.createService('Drive')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setScope(DRIVE_SCOPE)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties()) // Store the token in user properties
    .setParam('access_type', 'offline') // 'offline' access so a refresh token is issued
    .setParam('prompt', 'consent'); // Force consent screen to ensure a refresh token is always returned
}

function authCallback(request) {
  var driveService = getDriveService();
  var isAuthorized = driveService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function uploadFileToDrive(fileId, taskId) { //replace to firestore
  CLIENT_ID = '487184527223-qp562ijm94f22pom5m9i7ir6ofmonglr.apps.googleusercontent.com'; // Replace with your client ID
  CLIENT_SECRET = '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'; // Replace with your client secret
  DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  var driveService = getDriveService(CLIENT_ID, CLIENT_SECRET, DRIVE_SCOPE);
  if (!driveService.hasAccess()) {
    var authorizationUrl = driveService.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: ' + authorizationUrl);
    MailApp.sendEmail({
      to: 'am5737@columbia.edu',
      subject: 'SCRIPT AUTHORIZATION REQUIRED',
      body: 'Authorization URL: ' + authorizationUrl + '\n'
    });
    return;
  }

  if (fileId) {
    var boundary = "xxxxxxxxxx";
    var file = DriveApp.getFileById(fileId); //replace to firestore
    var blob = file.getBlob();
    var data = "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getName() + "\"\r\n";
    data += "Content-Type: " + blob.getContentType() + "\r\n\r\n";
    var payloadBlob = Utilities.newBlob(data, "multipart/form-data; boundary=" + boundary);
    var payloadData = blob.getBytes();
    var payload = [].concat.apply([], [payloadBlob.getBytes(), payloadData, Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes()]);
    var options = {
      method: "post",
      headers: {
        "Authorization": '',
        "Content-Type": "multipart/form-data; boundary=" + boundary
      },
      payload: Utilities.newBlob(payload).getBytes()
    };
    var url = "https://app.asana.com/api/1.0/tasks/" + taskId + "/attachments";
    UrlFetchApp.fetch(url, options);
  }
}
