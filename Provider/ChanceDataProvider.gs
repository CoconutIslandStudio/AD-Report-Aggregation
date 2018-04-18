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
    
    //Logger.log("ChanceURL: "+ req_url+query_str);
    
    var receive_data = resp.getContentText();
    var datajson = JSON.parse(receive_data);
    
    var appdata = null;
    var videoDataList = {};
    if(query_publisherId != undefined){
    
      appdata = datajson['data'][query_publisherId];
      videoDataList = appdata['40']['list'];
    
    }
    else
    {
      var applist = datajson['data'];
      for(var appid in applist){
          var itemdata = applist[appid];
          if(!itemdata || !itemdata['40'] || !itemdata['40']['list']) continue;
          
          var itemVideoDataList = itemdata['40']['list'];
          for(var day in itemVideoDataList){
              var daydata = itemVideoDataList[day];
              if(videoDataList[day] == undefined){
                  videoDataList[day] = daydata;
              }
              else{

                  videoDataList[day]['income'] =parseFloat(videoDataList[day]['income']) +  parseFloat(daydata['income']);
                  videoDataList[day]['clickvideopic'] =parseInt(videoDataList[day]['clickvideopic'])+ parseInt(daydata['clickvideopic']);
                  videoDataList[day]['playSuccess'] = parseInt(videoDataList[day]['playSuccess'])+ parseInt(daydata['playSuccess']);
              }
          }
      }
    }

    
    
    var sheet = spreadsheet.getSheetByName(sheetConfig.Table);
    sheet.getRange('A1:H1').setValues([["Day","Revenue","eCPM",'Clicks','Impressions','Views','CompleteRate','Provider']]);
    query_start = SheetClear(sheet,query_start,query_end);
    
    ForeachDate(query_start,query_end,function(x){
      var day = FormatDate(x);
      var data = videoDataList[day];
      if(data){
        
        var revenue = (data['income']/ 6.4).toFixed(2);
        var click = data['clickvideopic'];
        var impression = data['playSuccess'];
        var ecpm = (impression == 0 ? 0: (revenue*1000.0 /impression)).toFixed(2);
      
        var rowdata = [day,revenue,ecpm,click,impression,0,1,'Chance'];
        sheet.appendRow(rowdata);
      }
      else{
        sheet.appendRow([day,0,0,0,0,0,1,'Chance']);
      }
    });
  }
  
    //-------------------------------------------------------------------------------
  
   this.ProcessRealTime = function(spreadsheet,sheetConfig){
   
    Logger.log('========ChanceRT===========');
   
    var req_option = {
    'method': 'get'};
    
    var query_publisherId = sheetConfig.PublisherId;
    
    var query_start = sheetConfig.EndTime;
    var query_end = sheetConfig.EndTime;
    var query_str = Utilities.formatString('username=%s&key=%s&sdate=%s&edate=%s',
                                           chanceUserName,chanceKey,query_start,query_end);
    var req_url = 'http://dev.cocounion.com/webindex/appReportAPI?';
    //Make Post
    var resp = UrlFetchApp.fetch(req_url+query_str, req_option);
    
    var receive_data = resp.getContentText();
    var datajson = JSON.parse(receive_data);
    
    
    var appdata = datajson['data'][query_publisherId];
    
    
    var videoDataList = appdata['40']['list'];
    var sheet = spreadsheet.getSheetByName(sheetConfig.Table);
    

    var day = new Date();
    day.setMinutes(0);
    day.setSeconds(0);
    day.setMilliseconds(0);
    
    var remotedt = new Date(query_end);
    remotedt.setHours(day.getHours());
    var fmtday = FormatDate(remotedt);
    
    var rt_sheet = sheet;
    var rt_newdate = remotedt;
    
    var newdata = videoDataList[fmtday];
    
    var rt_newdata = null;
    if(newdata != null){
    
        var revenue = (newdata['income']/ 6.4).toFixed(2);
        var click = newdata['clickvideopic'];
        var impression = newdata['playSuccess'];
        var ecpm = (impression == 0 ? 0: (revenue*1000.0 /impression)).toFixed(2);
        rt_newdata = [day.toISOString(),revenue,ecpm,click,impression,0,1,'Chance'];
    }
    
    InsertRealTimeData(rt_sheet,rt_newdate,rt_newdata);
    
  }
}


function DataProvider_Chance(genericConfig){
  
  var username = genericConfig['ChanceUser'];
  var key = genericConfig['ChanceKey'];
  
  return new ChanceProvider(username,key);
}
