/*
 * translate text string to arryed buffer
 */
function t2ab(str /* String */)
{
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++)
    {
        view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
}

/*
 * translate arrayed buffer to text string
 */
function ab2t(buffer /* ArrayBuffer */)
{
    var arr = new Int8Array(buffer);
    var str = "";
    for(var i = 0, l = arr.length; i < l; i++)
    {
        str += String.fromCharCode.call(this, arr[i]);
    }
    return str;
}

// chrome socket
var udp = chrome.sockets.udp;
// SSDP multicast address
var SSDPMulticastAddress = "239.255.255.250";
// SSDP multicast port
var SSDPMulticastPort = 1900;
// M-Search packed w/ "ssdp:all"
var MSearchAll = "M-SEARCH * HTTP/1.1\r\n" +
    "ST: ssdp:all\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MX: 10\r\n\r\n";
    
var sid = null;
var devices = {};
/*
 * This function will be called when "SSDP Start" button is pushed.
 */
var ssdpStart = function(callback)
{
    // create udp socket
    udp.create(null, function(createInfo){
        sid = createInfo.socketId;
        console.log("socket id: " + sid);
        udp.bind(sid, "0.0.0.0", 0, function(result){
            if(result !== 0) {
                throw('cannot bind socket');
                return -1;
            }
            
            callback();
        });
    });
    
    udp.onReceive.addListener(function(info){
      if(info.socketId != sid){
        return;
      }
      var pattern;
      var match;
      var response = ab2t(info.data)
      var device = {}
      
      pattern = /^USN: (.*)$/m
      match = pattern.exec(response)
      device.usn = match[1];
      
      pattern = /^ST: (.*)$/m
      match = pattern.exec(response)
      device.st = match[1];
      
      pattern = /^LOCATION: (.*)$/m
      match = pattern.exec(response)
      device.location = match[1];
      device.lastMessageTime = (new Date()).getTime();
      
      devices[device.usn] = device;
    });
};

function Main(){
  ssdpStart(function(){
    var buffer = t2ab(MSearchAll);
    var interval = window.setInterval(function(){
      for(var i = 0; i < 2; i++){
        udp.send(sid, buffer, SSDPMulticastAddress, SSDPMulticastPort, function(sendInfo){
          if(sendInfo.resultCode < 0) {
            throw("Error sending data");
          }
        });
      }
      
      var now = (new Date()).getTime();
      for(var key in devices){
        var device = devices[key];
        
        if(now > device.lastMessageTime + 60*1000){
          delete(devices[key]);
        }
      }
      
    }, 5000);
    
    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
      if (request.request == "GetDevices"){
        
        sendResponse({response: devices, error: null});
      }
    });
  });
}

Main();
