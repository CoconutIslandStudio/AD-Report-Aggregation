var ChanceProvider = function(username,key){
  
  var chanceUserName = username;
  var chanceKey = key;
  
  this.Process = function(spreadsheet,sheetConfig){
    var req_option = {
    'method': 'get'};
    
    var query_publisherId = sheetConfig.PublisherId;
    
    var query_start = sheetConfig.StartTime;
    var query_end = sheetConfig.EndTime;
    var query_str = Utilities.formatString('username=%s&key=%s&sdate=%s&edate=%s',
                                           chanceUserName,chanceKey,query_start,query_end);
    Logger.log('querystr: %s',query_str);
    var req_url = 'http://dev.cocounion.com/webindex/appReportAPI?';
    //Make Post
    var resp = UrlFetchApp.fetch(req_url+query_str, req_option);
    
    var receive_data = resp.getContentText();
    var datajson = JSON.parse(receive_data);
    
    
    var appdata = datajson['data'][query_publisherId];
    
    
    var videoDataList = appdata['40']['list'];
    
    
    
    var sheet = spreadsheet.getSheetByName(sheetConfig.Table);
    sheet.clear();
    
    sheet.appendRow(["Date","revenue","click","impression"]);
    
    ForeachDate(query_start,query_end,function(x){
      var day = FormatDate(x);
      var data = videoDataList[day];
      if(data){
        var rowdata = [day,data['income'],data['clickvideopic'],data['playSuccess']];
        sheet.appendRow(rowdata);
      }
      else{
        sheet.appendRow([day,0,0,0]);
      }
    });
    
    
    /*
    datajson.sort(function(x,y){
    var d1 = x['date'];
    var d2 = y['date'];
    return d1.localeCompare(d2);
  });
  */
    
    /*
    var sheet = spreadsheet.getSheetByName(sheetConfig.Table);
    sheet.clear();
    
    sheet.appendRow(["Day","Revenue","eCPM",'Clicks','Completes','Views'])
    
    for(var i=1;i < datajson.length; i++){
      var data = datajson[i];
 
      var objs = [data['date'],data['revenue'],data['ecpm'],data['clicks'],data['completes'],data['views']];
      sheet.appendRow(objs);
      
    }
    */
  }
  
  
}

function DataProvider_Chance(genericConfig){
  
  var username = genericConfig['ChanceUser'];
  var key = genericConfig['ChanceKey'];
  
  return new ChanceProvider(username,key);
}
