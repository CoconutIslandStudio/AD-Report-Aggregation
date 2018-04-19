function DataProvider_Chartboost(generalConfig){
  
  var userid = generalConfig['ChartboostUserID'];
  var usersig = generalConfig['ChartboostUserSig']
  
  return new ChartboostProvider(userid,usersig);
}

var ChartboostProvider = function(userid,usersig){
    
      
    
    var cb_userid = userid;
    var cb_usersig = usersig;
    
    this.Process = function(spreadsheet,sheetconfig){
        
        Logger.log('========= Chartboost ========')
        
        var query_start = sheetconfig.StartTime;
        var query_end = sheetconfig.EndTime;
        
        
        var appid = sheetconfig.appid;
        
        var query_platform = sheetconfig.Platform;
        
        if(query_platform == undefined){
            
        }
        else{
          if(query_platform === "android"){
              query_platform = "Google Play";
          }
          else if (query_platform === "ios")
          {
              query_platform = "iOS";
          }
          else{
            query_platform = undefined;
          }
        }
        
        var query_str = Utilities.formatString('dateMin=%s&dateMax=%s&aggregate=daily&userId=%s&userSignature=%s',
            query_start,
            query_end,
            cb_userid,
            cb_usersig
        );
        
        var query_all_app = true;
        if(appid != undefined){
          query_all_app = false;
          
          query_str+=("&appId="+ appid);
        }
        
        var query_url = "https://analytics.chartboost.com/v3/metrics/app?";
        
        var final_url = query_url + query_str;
        
        Logger.log(final_url);
        
        var resp = UrlFetchApp.fetch(final_url);
        var receive_data = resp.getContentText();
        
        var datajson = JSON.parse(receive_data);
        
        var datacount = datajson.length;
        
        var dataary = {};
        
        for(var i=0;i<datacount;i++){
        
            var dobj = datajson[i];
            
            if(query_platform != undefined){
              if(!strComp(dobj.platform,query_platform)) continue;
            }
            
            
            if(query_all_app == false){
                dataary[dobj.dt] = dobj;
            }
            else{
              var lastRecord = dataary[dobj.dt];
              
              if(lastRecord == undefined){
                dataary[dobj.dt] = dobj;
              }
              else{
                dataary[dobj.dt].moneyEarned += dobj.moneyEarned;
                dataary[dobj.dt].impressionsDelivered += dobj.impressionsDelivered;
                dataary[dobj.dt].clicksDelivered += dobj.clicksDelivered;
                dataary[dobj.dt].videoCompletedDelivered += dobj.videoCompletedDelivered;
                dataary[dobj.dt].ecpmEarned = (dataary[dobj.dt].moneyEarned *1000/dataary[dobj.dt].impressionsDelivered);
                
                //Logger.log("add: "+ lastRecord.moneyEarned);
              }
            }
           
            
        }
        
        
        var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
        
        sheet.getRange('A1:H1').setValues([["Day","Revenue","eCPM",'Clicks','Impressions','Views','CompleteRate','Provider']]);
    
        query_start = SheetClear(sheet,query_start,query_end);
        
        ForeachDate(query_start,query_end,function(x){
            var day = FormatDate(x);
            var daydata = dataary[day];
            
            if(daydata){
                
                var revenue = daydata.moneyEarned.toFixed(2);
                var ecmp = daydata.ecpmEarned.toFixed(2);
                var impression = daydata.impressionsDelivered;
                var click = daydata.clicksDelivered;
                var complete = daydata.videoCompletedDelivered;
                var completerate = (impression == 0 ? 1.0 : (complete *1.0 / impression)).toFixed(2);
                
                // date, revenue, 
                var obj = [day,revenue,ecmp,click,impression,complete,completerate,'Chartboost'];
                sheet.appendRow(obj);
            }
            else{
                sheet.appendRow([day,0,0,0,0,0,1.0,'Chartboost']);
            }
        
        });
        
        Logger.log('========= Chartboost End ========')
        
    }

}