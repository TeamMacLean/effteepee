$(document).ready(function () {

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