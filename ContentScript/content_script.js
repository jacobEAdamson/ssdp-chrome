$(document).ready(function(){
  ssdp.GetDevices(function(devices){
    var rokuDevices = ssdp.FilterByType(devices, 'roku:ecp');
    console.log(rokuDevices);
    
    window.setTimeout(function(){
      data = $('div.player').data();
      if(data != undefined){
        //There's a player on the page
        var select = $('<select></select>');
        select.append('<option value=""></option>');
        for(key in rokuDevices){
          select.append('<option value="'+ rokuDevices[key].location +'">'+ key +'</option>');
        }
        
        $('div.channel').append(select);
        select.on('change', function(){
          if(this.value != ""){
            url = this.value + 'launch/50539?' + $.param({contentID: data.channel});
            console.log(url);
            
            $.ajax({
              type: 'POST',
              url: url,
              data: {}
            });
          }
        });
      }
    }, 5000);
  });
});

