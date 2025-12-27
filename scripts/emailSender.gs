/**
 * Google Apps Script for HeartBeats Email Service
 * 
 * INSTRUCTIONS:
 * 1. Go to script.google.com and create a new project.
 * 2. Paste this code into Code.gs.
 * 3. Deploy as Web App:
 *    - Click "Deploy" > "New deployment".
 *    - Select type: "Web app".
 *    - Description: "Email Sender v1".
 *    - Execute as: "Me" (your email).
 *    - Who has access: "Anyone" (allows the website to call it without complex auth).
 * 4. Copy the "Web app URL" and provide it to the website developer.
 */

function doPost(e) {
  try {
    // Parse the JSON body from the request
    var data = JSON.parse(e.postData.contents);
    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    
    // Validate required fields
    if (!to || !subject || !htmlBody) {
      return ContentService.createTextOutput(JSON.stringify({ 
        'status': 'error', 
        'message': 'Missing required fields: to, subject, or htmlBody' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Send the email
    GmailApp.sendEmail(to, subject, '', {
      htmlBody: htmlBody,
      name: 'HeartBeats Admin' // Sender name
    });
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ 
      'status': 'success', 
      'message': 'Email sent to ' + to 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({ 
      'status': 'error', 
      'message': error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * TEST FUNCTION
 * Run this function manually from the Apps Script editor to verify permissions and functionality.
 */
function testEmail() {
  var testRecipient = Session.getActiveUser().getEmail(); // Sends to yourself
  var subject = "Test Email from HeartBeats Script";
  var htmlBody = "<h1>Success!</h1><p>The Google Apps Script email sender is working correctly.</p>";
  
  console.log("Attempting to send email to: " + testRecipient);
  
  try {
    GmailApp.sendEmail(testRecipient, subject, '', {
      htmlBody: htmlBody,
      name: 'HeartBeats Test'
    });
    console.log("Email sent successfully!");
  } catch (e) {
    console.error("Failed to send email: " + e.toString());
  }
}
