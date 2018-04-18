

var ConfigSheet = function(sheetId,sheetName){
  
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  var generalConfig = null;
  var sheetConfig = new Array();
  
  this.Verify = function(){
    var data = sheet.getDataRange().getValues();
    for(var i =0;i<data.length;i++){
      var key = data[i][0];
      if(!key) continue;
      var val = data[i][1].toString();
      
      
      if(strComp(key,"#General")){
        generalConfig = JSON.parse(data[i][1]) ;
      }
      else if(strComp(key,"#Sheet")){
        var sc = JSON.parse(val);
        sc.sheetRow = i;
        sc.EndTime = strComp(sc.EndTime,"Today") ? Utilities.formatDate(new Date(),'UTC','yyyy-MM-dd') : sc.EndTime;
        
        if(sc){
         sheetConfig.push(sc); 
        }
      }
    }
    
    Logger.log(generalConfig);
    Logger.log(sheetConfig);
    
    Logger.log("");
  }
  
  this.Run = function(){
    for(var i =0;i<sheetConfig.length;i++){
      var data = sheetConfig[i];
      
      
      var error = null;
      
      var log = "";
      try{
        var DataProvider = GetDataProvider(data.Provider);
        var dp = DataProvider(generalConfig);
         log = dp.Process(spreadsheet,data);
      }catch(err){
        error = err;
      }
      
      var cell =sheet.getRange('C'+(data.sheetRow+1));
      
      if(error == null){
        cell.setValue(data.Table+"\nSuccess\n["+new Date()+"]" +"\n log:"+ log)
        cell.setFontColor("#000000");
      }
      else{
        cell.setValue(data.Table+"\nFail\n["+new Date()+"]\n"+error + +"\n log:"+ log);
        cell.setFontColor("#ff0000");
      }
    }
  }
  
  this.GetRealTimeData = function(){
      for(var i =0;i<sheetConfig.length;i++){
      var data = sheetConfig[i];
      
      var error = null;
      
      var log = "";
      try{
        var DataProvider = GetDataProvider(data.Provider);
        var dp = DataProvider(generalConfig);
         log = dp.ProcessRealTime(spreadsheet,data);
      }catch(err){
        error = err;
      }
      
      var cell =sheet.getRange('C'+(data.sheetRow+1));
      
      if(error == null){
        cell.setValue(data.Table+"\nSuccess\n["+new Date()+"]" +"\n log:"+ log)
        cell.setFontColor("#000000");
      }
      else{
        cell.setValue(data.Table+"\nFail\n["+new Date()+"]\n"+error + +"\n log:"+ log);
        cell.setFontColor("#ff0000");
      }
    }
  }
}

function GetDataProvider(provider){
  var method = eval("DataProvider_"+provider);
  return method;
}
