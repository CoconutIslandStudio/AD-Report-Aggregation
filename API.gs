function ADReportAggregation(sheetId,sheetName){
  var config = new ConfigSheet(sheetId,sheetName);
  config.Verify();
  config.Run();
  
  return config;
}

function ADReportAggregationRealTime(sheetId,sheetName){
  var config = new ConfigSheet(sheetId,sheetName);
  config.Verify();
  config.GetRealTimeData();
  
  return config;
}


function InsertRealTimeData(sheet,newdate,newrow){
    var mrows = sheet.getMaxRows();
    var sheet_data = null;
     
    if(mrows > 1){
        sheet_data = GetLastValidRow(sheet)
    }
    
    var data = newrow;
    
    if(data != null){
        if(sheet_data != null){
            var dt_sheet = sheet_data[0];
            var dt_remote = newdate.toISOString();
            Logger.log('sheetTime '+dt_sheet);
            Logger.log('remoteTime '+dt_remote);
            
            var impression = data[4];
            var sheetimpression = sheet_data[4];
            Logger.log(impression +'-'+sheetimpression);
            
            if(strComp(dt_sheet,dt_remote)){
                if(strComp(impression.toString(),sheetimpression.toString())){
                  Logger.log('same impression skip!');
                  return;
                }
                else{
                  Logger.log('override last data');
                  DelteSheetRow(sheet);
                }
                
            }
        }
        sheet.appendRow(newrow);
    }

}
