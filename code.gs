function createMenu () {
  
  const ui = SpreadsheetApp.getUi();
  const sessionLocal = Session.getActiveUserLocale();
  ScriptProperties.setProperty("title", LanguageApp.translate("Delete on:", 'en', sessionLocal));
  ScriptProperties.setProperty("buttonDel", LanguageApp.translate("Delete", 'en', sessionLocal));
  ScriptProperties.setProperty("buttonCanc", LanguageApp.translate("Cancel", 'en', sessionLocal));

  ScriptProperties.setProperty("plchldr", LanguageApp.translate("Name or Id...", 'en', sessionLocal));
  ScriptProperties.setProperty("selectAll", LanguageApp.translate("Select all", 'en', sessionLocal));
  ScriptProperties.setProperty("clearAll", LanguageApp.translate("Clear all", 'en', sessionLocal));

  const menu = ui.createMenu(LanguageApp.translate("Menu", 'en', sessionLocal));
  menu.addItem(LanguageApp.translate("Delete Temporary Filter View", 'en', sessionLocal) ,"loadForm");
  menu.addToUi();
  
}

function onOpen() {
        
  createMenu();

}

function loadForm () {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ssId = ss.getId();
  const sheetActiveId = ss.getActiveSheet().getSheetId();
  const htmlForSidebar = HtmlService.createTemplateFromFile("index");
  const tmpVFJSON = JSON.stringify(tmpViewFilter(sheetActiveId,ssId));
  ScriptProperties.setProperty("ssId", ssId);
  ScriptProperties.setProperty("array",tmpVFJSON);
  htmlForSidebar.data = tmpVFJSON;
  htmlForSidebar.buttonDel = ScriptProperties.getProperty("buttonDel");
  htmlForSidebar.buttonCanc = ScriptProperties.getProperty("buttonCanc");

  htmlForSidebar.plchldr = ScriptProperties.getProperty("plchldr");
  htmlForSidebar.selectAll = ScriptProperties.getProperty("selectAll");
  htmlForSidebar.clearAll = ScriptProperties.getProperty("clearAll");

  const htmlOutput = htmlForSidebar.evaluate();
  let titleOn = ScriptProperties.getProperty("title") + " " + ss.getActiveSheet().getName();
  
  htmlOutput.setTitle(titleOn);
  const ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlOutput);
  
}

function tmpViewFilter(sheetActiveId,ssId) {
  const response = Sheets.Spreadsheets.get(ssId, { fields: 'sheets/properties/sheetId,sheets/filterViews/title,sheets/filterViews/filterViewId', });
  
  let sheet;
  for (let s of response.sheets) {
    if (s.properties.sheetId == sheetActiveId) {
      sheet = s;
    }
  }
  
  const tmpVFTable = [];
  let i = 0;
  for (let fv of sheet.filterViews) {
      tmpVFTable.push([]);
      tmpVFTable[i].push(fv.title);
      tmpVFTable[i].push(fv.filterViewId);
      tmpVFTable[i].push(fv.title + fv.filterViewId);
      i++;
  }
  
  return tmpVFTable;
}



function buttonSave(data) {
  
  let arr = JSON.parse(ScriptProperties.getProperty("array"));
  let ssId = ScriptProperties.getProperty("ssId");
  
  const requests = [];
  for (let x = 0; x < data.length; x++) {
    let value = arr.filter(word => word[2] == data[x]);
    value = value.flat();
    requests.push({deleteFilterView: {filterId: value[1]}});
  };

  const batchRequest = {
    includeSpreadsheetInResponse: false,
    requests: requests
  };
  
  Sheets.Spreadsheets.batchUpdate(batchRequest, ssId);

  let refresh = SpreadsheetApp.getActiveRange().createFilter();
  refresh.remove();




}

