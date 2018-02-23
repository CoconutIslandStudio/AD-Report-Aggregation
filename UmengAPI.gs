var UmengAPI = function(email,pwd){
  
  this._GetToken = function(){
   
    var url = 'http://api.umeng.com/authorize';
    
    var authdata = Utilities.formatString('email=%s&password=%s',
                                       email,pwd);
    
    var req_option = {
      'method': 'post',
      'headers':{
        'Accept': 'application/json'
      },
      'payload': authdata
    };
    
    
    var resp = UrlFetchApp.fetch(url,req_option);
    
    var respobj = JSON.parse(resp.getContentText());
    return respobj.auth_token;
  }
  
  this.authToken = this._GetToken();
  
  this.valid = this.authToken != undefined;
}


function UmengTest(){
 
  var umengapi = new UmengAPI('coconut.island.studio@gmail.com','coconut1805');
  Logger.log('umengapi valid - %b',umengapi.valid);
  Logger.log('umengapi authtoken - %s', umengapi.authToken);
  
}
