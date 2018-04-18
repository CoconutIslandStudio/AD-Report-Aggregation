

function FormatDate(dt){
 var mm = dt.getMonth() + 1;
  var dd = dt.getDate();
  return [dt.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};


function strComp(str1,str2){
  if(str1 > str2 || str1 < str2){
   return false; 
  }
  return true;
}

function GetLastDate(sheet){
    var lastRow = sheet.getLastRow();
    var lastDateCell = sheet.getRange(lastRow,1);
    var lastDate = new Date(lastDateCell.getValue());
    return lastDate;
}

function DayElapsed(date1,date2){
  
  return (date2.getTime() - date1.getTime())/1000/3600/24
  
}


function GetLastValidRow(sheet){

  var maxrows = sheet.getMaxRows();
  for(var j=maxrows;j>=1;j--){
  
      var row = sheet.getRange('A'+j+":H"+j);
      var rowobj= row.getValues();
      var rowdate = rowobj[0][0];
      if(rowdate != null && rowdate != undefined){
          return rowobj[0];
      }
   }
}

function SheetSetRow(sheet,colA,colB,row,data){
  sheet.getRange(colA+row+":"+colB+row).setValues([data]);
}

//return new sdate and index
function SheetClear(sheet,sdate,edate){

  var dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() -1);
  dateThreshold.setUTCHours(0);

  var startDate = new Date(sdate);
  var maxrows = sheet.getMaxRows();
  for(var j = maxrows;j>=1;j--){
      var row = sheet.getRange('A'+j);
      var rowobj = row.getValues();
      var rowdate = rowobj[0][0].toString();
      
      if(j == 1){
         return sdate;
      }
      
      sheet.deleteRow(j);
      //sheet.getRange('A'+j+':H'+j).setValues([[,,,,,,,,]]);
      
      if(rowdate == null || rowdate == undefined){
        continue;
      }
      
      var isvalid = IsDate(rowdate);
      if(!isvalid){
        continue;
      }
      
      var dateRow = new Date(rowdate);
          Logger.log("rowdate "+rowdate);
        Logger.log("dateRow "+dateRow);
      
      if(dateRow > dateThreshold){
        continue;
      }
      
      
      
      if(startDate < dateRow){
          var retdate = FormatDate(dateRow);
          Logger.log("retdate "+retdate);
          
          return retdate;
      }
      
      return sdate;
  }


}

function IsDate(obj){
  var d = new Date(obj);
  if (isNaN(d.getTime())) 
    {
        return false;
    }
    else{
        return true;
    }
  
}

function DelteSheetRow(sheet){
    var maxrows = sheet.getMaxRows();
  for(var j=maxrows;j>=1;j--){
  
      var row = sheet.getRange('A'+j+":H"+j);
      var rowobj= row.getValues();
      var rowdate = rowobj[0][0];
      if(rowdate != null && rowdate != undefined){
          Logger.log('delete:'+j);
          sheet.deleteRow(j);
          return;
      }
   }
}


function ForeachDate(sdate,edate,func){
    var d1 = new Date(sdate);
    var d2 = new Date(edate);
  
    if(d1 > d2){
      return;
    }
    var d = d1;
    while(d < d2){
      func(d);
      d.setDate(d.getDate()+1);
    }
}
