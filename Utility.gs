

function FormatDate(date){
 return Utilities.formatDate(date,"UTC","yyyy-MM-dd") 
  
 
}


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

function ForeachDate(sdate,edate,func){
    var d1 = new Date(sdate);
    var d2 = new Date(edate);
  
    if(d1 > d2) return;
    var d = d1;
    while(d < d2){
      func(d);
      d.setDate(d.getDate()+1);
    }
}
