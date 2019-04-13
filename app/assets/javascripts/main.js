$(document).ready(function(){
  var recording = false;
  var bufferSize = 256;
  var amplitude = document.getElementById('amplitude');
  var spectrum = document.getElementById('spectrum');
  var dot =  document.createElement("div");
  dot.style.position = 'absolute';
  dot.className = 'dot';
  
  var cosTable = [];
	var sinTable = [];
	for (var i = 0; i < bufferSize/6; i++) {
		cosTable[i] = Math.cos(2 * Math.PI * i / bufferSize);
		sinTable[i] = -Math.sin(2 * Math.PI * i / bufferSize);
	}
  function DFT(data,size,gain){
    var x = new Array();
    var N =data.length;
    var k = 0;
    for(var k=0;k<size;k++){
      var v = Complex(0);
      var w = Complex(cosTable[k],sinTable[k]);
      var wn = Complex(1);
      for(var n=0;n<N;n++){
        v =  wn.mul(gain*data[n]).add(v);
        wn = wn.mul(w);
      }
      x[k] = v.abs();
    }
    return x;
  }

  function showAmpitude(arr,size,gain){
    
    for(var i=0; i<size; i++){
      dot.style.bottom = gain*arr[i].toString()+"px";
      dot.style.left = 2*i.toString()+"px";
      dot.style.height = '2px';
      dot.style.width = '2px';
      dot.style.backgroundColor = '#3366FF';
      $(dot).clone().appendTo(amplitude);
    }
    
  }
  function showSpectrum(arr,size,gain){
    var axitX=0;
    for(var i=0; i<size; i++){
      var a =gain*arr[i];
      if(a>320){
        a = 320;
      }
      dot.style.backgroundColor = '#0000FF';
      dot.style.bottom = "0px";
      dot.style.left = axitX.toString()+"px";
      dot.style.width = "12px";
      dot.style.height = a.toString()+"px";
      $(dot).clone().appendTo(spectrum);
      axitX+=16;
    }
  }
  function clearScreen(){
    $('.dot').remove();
  }
  
  var handleSuccess = function(stream) {
    var context = new AudioContext();
    var source = context.createMediaStreamSource(stream);
    var processor = context.createScriptProcessor(bufferSize, 1, 1);
    source.connect(processor);
    processor.connect(context.destination);
    processor.onaudioprocess = function(e) {
      if(recording){
        clearScreen();
        showAmpitude(e.inputBuffer.getChannelData(0),128,70);
        showSpectrum(DFT(e.inputBuffer.getChannelData(0),32,1),32,10);
      }
    };
  };
  
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(handleSuccess);
  
  $("#record").click(function(){
    if(recording){
      recording = false;
      this.style.backgroundColor = "#F1948A";
    }else{
      recording = true;
      this.style.backgroundColor = "#85C1E9";
    }
  });
  var pathvideo = document.getElementById('pathvideo');
  var video = document.getElementById('video');
  const change = function(e) {
      video.innerHTML = e.target.value;
    }
  pathvideo.addEventListener('input', change);
  var imgFile = document.getElementById('choose');
  $("#chanbg").click(function(){
      $(imgFile).trigger('click');
  });
  $('#choose').on('change', function() {
      if (this.files) {
          var reader = new FileReader();
          reader.onload = function(event) {
             document.body.style.backgroundImage = "url("+event.target.result+")";
          }
          reader.readAsDataURL(this.files[0]);
      }
  });
});