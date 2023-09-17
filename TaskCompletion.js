function updateAsanaTask(e) {
    var formResponse = e.response;
    var itemResponses = formResponse.getItemResponses();
    var userEmail = formResponse.getRespondentEmail();
  
    var binStationOptions = {
      'Hartley Lounge': '1204798167766591',
      'East Campus Lounge': '1204798167766593',
      'Schapiro Lounge': '1204798167766592'
    };
  
    var binStatusOptions = {
      'Bin Checked-Out [Time Not Expired]': '1204800731885545',
      'Bin Not Returned [Time Expired]': '1204800731885546',
      'Bin Returned [Late]': '1204800731885547',
      'Bin Returned [On Time]': '1204800731885548'
    };
  
    var uni = "";
    var dollyNumber = "";
    var binStation = "";
    var residenceHall = "";
    var fullName = "";
  
    for (var i = 0; i < itemResponses.length; i++) {
      var question = itemResponses[i].getItem().getTitle();
      var answer = itemResponses[i].getResponse();
      
      uni = userEmail.split('@')[0].toLowerCase();
  
      switch(question) {
        case 'Please enter your Full Name:':
          fullName = answer;
          break;
        case 'Please enter the Bin/Dolly Number:':
          dollyNumber = answer.toLowerCase();
          break;
        case 'Please select the Bin Station:':
          binStation = answer;
          break;
        case 'Please select your current Residence Hall:':
          residenceHall = answer;
          break;
      }
    }
  
    var taskName = "FY24 Bin Check-Out | UNI: " + uni + " | Dolly #" + dollyNumber + " | Bin Station: " + binStation + " | Residence Hall: " + residenceHall;
  
    var options = {
      'method' : 'get',
      'headers': {
        'Authorization': 'Bearer 1/1201598818645288:5fc1fde19d751f71f8dda45c588f9bc5',
        'Content-Type': 'application/json'
      }
    };
  
    var response = UrlFetchApp.fetch('https://app.asana.com/api/1.0/projects/1204641478250112/tasks?opt_fields=name,custom_fields,due_at', options);
    var tasks = JSON.parse(response.getContentText()).data;
  
    var taskFound = false;
  
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].name == taskName) {
        taskFound = true;
        var binReturnTime = new Date(tasks[i].due_at);
        var now = new Date();
  
        var update = {
          'data': {
            'custom_fields': {
              '1204800731885544': now > binReturnTime ? binStatusOptions['Bin Returned [Late]'] : binStatusOptions['Bin Returned [On Time]']
            }
          }
        };
  
        var updateOptions = {
          'method' : 'put',
          'headers': {
            'Authorization': '',
            'Content-Type': 'application/json'
          },
          'payload' : JSON.stringify(update)
        };
  
        UrlFetchApp.fetch('https://app.asana.com/api/1.0/tasks/' + tasks[i].gid, updateOptions);
        // Send an email to the user
        MailApp.sendEmail({
          to: userEmail, // replace this with the actual email of the user
          subject: 'Bin Return Confirmation Receipt',
          body: 'Bin #' + dollyNumber + '\n' +
            'Bin Return Time: ' + new Date().toLocaleString() + '\n' +
            'Bin Return Deadline: ' + binReturnTime.toLocaleString() + '\n' +
            'Bin Station: ' + binStation + '\n' + 
            'Current Residence Hall: ' + residenceHall
        });
        break;
      }
    }
  
    if (!taskFound) {
      // Send an email to the user
      MailApp.sendEmail({
        to: userEmail, // replace this with the actual email of the user
        subject: 'Bin Return Error',
        body: 'We could not find a bin checked out with the information you provided. Please verify the information and re-submit the Bin Return Form. \n' + 
        ' ' + '\n' + 
        'Here is what you submitted: \n' + 
        ' ' + '\n' + 
        'Full Name: ' + fullName + '\n' + 
        'UNI: ' + uni + '\n' + 
        'Bin #' + dollyNumber + '\n' +
        'Bin Station: ' + binStation + '\n' + 
        'Current Residence Hall: ' + residenceHall + '\n' + 
        'If this error persists, please speak to a Housing Staff Member at the Hartley Hospitality Desk.'
      });
    }
  }
