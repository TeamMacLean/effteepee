$(document).ready(function () {

  var SelectedFile;

  function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
    document.getElementById('fileUploadModal').value = SelectedFile.name;
  }

  var socket = io.connect('http://localhost:8080');
  var FReader;

  socket.on('MoreData', function (data) {
    UpdateBar(data['Percent']);
    var Place = data['Place'] * 524288; //The Next Blocks Starting Position
    var NewFile; //The Variable that will hold the new Block of Data

    if (SelectedFile.slice) {
      NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
    }
    else if (SelectedFile.webkitSlice) {
      NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
    }
    else if (SelectedFile.mozSlice) {
      NewFile = SelectedFile.mozSlice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
    } else {
      alert('Sorry but your browser does not support this');
    }

    FReader.readAsBinaryString(NewFile);
  });

  socket.on('Complete', function () {
    Completed();
  });

  function Completed() {
    document.getElementById('ProgressBar').style.width = 100 + '%';
    document.getElementById('percent').innerHTML = (Math.round(100 * 100) / 100) + '%';
    var MBDone = Math.round(((100 / 100.0) * SelectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = MBDone;
    window.location.reload();
  }

  function UpdateBar(percent) {
    document.getElementById('ProgressBar').style.width = percent + '%';
    document.getElementById('percent').innerHTML = (Math.round(percent * 100) / 100) + '%';
    var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = MBDone;
  }

  function StartUpload() {
    if (document.getElementById('FileBox').value != "") {

      FReader = new FileReader();
      var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + "</span>";
      Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
      Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
      document.getElementById('uploadInfo').innerHTML = Content;
      FReader.onload = function (evnt) {
        socket.emit('Upload', {'Name': SelectedFile.name, Data: evnt.target.result});
      };
      socket.emit('Start', {'Name': SelectedFile.name, 'Size': SelectedFile.size, 'Dir': window.location.pathname});
    }
    else {
      alert("Please Select A File");
    }
  }

  //These are the relevant HTML5 objects that we are going to use

  if (document.getElementById('UploadButton')) {

    if (window.File && window.FileReader) {
      document.getElementById('UploadButton').addEventListener('click', StartUpload);
      document.getElementById('FileBox').addEventListener('change', FileChosen);
    }
  }
  //else
  //{
  //    document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
  //}


  $(".table tr").click(function () {
    var $this = $(this);

    var aS = $this.find('a');

    if (aS.length) {
      //FOLLOW LINK
      document.location = aS[0].href;
    } else {
      console.log('error', 'could not follow link, please click on text.');
    }
  });

  $('#createFolder').on('input', function () {
    var $this = $(this);
    var text = $this.val();
    $this.val(text.split(' ').join('_'));

  });

});