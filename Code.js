function getAccesstoken() {
  Logger.log(ScriptApp.getOAuthToken());
  // DriveApp.getFiles() // This comment is used for including a scope of https://www.googleapis.com/auth/drive
}

/*
function doGet(e) {
  // Write hello world to the cell A1 in the first sheet
  Logger.log("=== Incoming GET Request ===");
  Logger.log("Type of Request: " + (typeof e));
  e["typeof"] = typeof e;
  var sheet = SpreadsheetApp.openById("1TA6w6Yu0d7TJAMSoWD2rSyyDYwmu6D1l6cv4HLpjNA4").getSheets()[0];
  Logger.log("Try to write to cell A1");
  sheet.getRange("A1").setValue("Hello, world!");
  return _jsonResponse(e, 200);
}
*/

/*
function doPost(e) {
  return _jsonResponse({ status: "success", message: "POST request processed" }, 200);
}
*/

/*
function doPost(e) {
  return _jsonResponse({ status: "TEST", message: "Execution result" }, 200);

  try {
    Logger.log("=== Incoming Request ===");

    // Validate request body
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log("No data received in the request body.");
      return _jsonResponse({ status: "error", message: "Empty request body" }, 400);
    }

    Logger.log("Raw Body: " + e.postData.contents);

    // Parse JSON
    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      Logger.log("JSON parsing failed: " + parseErr);
      return _jsonResponse({ status: "error", message: "Invalid JSON" }, 400);
    }

    Logger.log("Parsed Request Data: " + JSON.stringify(requestData));

    // Prepare outgoing payload (you could transform it if needed)
    var payload = {
      data: requestData.data || "default-data",
      text: requestData.text || "default-text"
    };

    Logger.log("Outgoing Payload: " + JSON.stringify(payload));

    // Make POST request to external API
    var url = "https://68af87d1b91dfcdd62bc80cf.mockapi.io/tester";
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();

    Logger.log("=== External API Response ===");
    Logger.log("Status Code: " + statusCode);
    Logger.log("Response Body: " + responseBody);

    // Build final response to client
    return _jsonResponse({
      status: "success",
      forwarded_status: statusCode,
      forwarded_response: safeParse(responseBody)
    }, statusCode);

  } catch (err) {
    Logger.log("Unexpected Error: " + err.stack);
    return _jsonResponse({ status: "error", message: err.message }, 500);
  }
}
*/

/**
 * Helper to safely parse JSON, or return raw text if invalid.
 */
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

/**
 * Helper to build JSON responses with proper MIME type.
 */
function _jsonResponse(obj, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
