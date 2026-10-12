/** Paste into Google Sheets > Extensions > Apps Script.
 * Script Properties: SPREADSHEET_ID, SHARED_SECRET (long random secret).
 * Deploy as Web App: execute as yourself; access Anyone.
 * This endpoint never returns sheet contents. Secret is checked before writes.
 */
function doPost(e) {
  var reply = function(ok) { return ContentService.createTextOutput(JSON.stringify({ok:ok})).setMimeType(ContentService.MimeType.JSON); };
  var lock=LockService.getScriptLock();
  try {
    var properties=PropertiesService.getScriptProperties();
    var secret=properties.getProperty('SHARED_SECRET');
    if(!e.postData || e.postData.contents.length>10000)return reply(false);
    var payload=JSON.parse(e.postData.contents);
    if(!secret||payload.secret!==secret||payload.consent!==true)return reply(false);
    var keys=['amount','purpose','firstName','lastName','email','phone','state','zip','employment','monthlyIncome','payFrequency'];
    if(keys.some(function(k){return typeof payload[k]!=='string'||!payload[k].trim()||payload[k].length>100;}))return reply(false);
    lock.waitLock(10000);
    var sheetFile=SpreadsheetApp.openById(properties.getProperty('SPREADSHEET_ID'));
    var sheet=sheetFile.getSheetByName('Inquiries')||sheetFile.insertSheet('Inquiries');
    if(sheet.getLastRow()===0)sheet.appendRow(['Submitted at (UTC)'].concat(keys,['Consent','Consent version']));
    // Prefix all untrusted text to prevent spreadsheet formula execution.
    var values=keys.map(function(k){return "'"+payload[k];});
    sheet.appendRow([new Date().toISOString()].concat(values,['true',"'inquiry-v1"]));
    SpreadsheetApp.flush();
    return reply(true);
  } catch(error) { return reply(false); }
  finally { if(lock.hasLock())lock.releaseLock(); }
}
