var today = new Date();
var day = today.getDate();
day ='#tanggal' + day;

var $tableParent;
var $dayElement;
var $dayPos;
var numFieldTrx = 1;

function parseCategory(category) {
    var parse = "";
    switch (category) {
        case '1':
            parse = "Laptop";
            break;
        case '2':
            parse = "Charger Laptop";
            break;
        case '3':
            parse = "Mouse";
            break;
        case '4':
            parse = "Headset";
            break;
        case '5':
            parse = "Keyboard";
            break;
        case '6':
            parse = "Monitor";
            break;
        case '7':
            parse = "Other";
            break;
        default:
            parse = "Error";
            break;
    }

    return parse;
}

$(document).ready(function() {
    $(".button-collapse").sideNav();
    $('.collapsible').collapsible(
        {hover: false}
    );
    $('select').material_select();
    $('.tooltipped').tooltip({delay: 50});
    $("#btnAddTrx").click(function () {
        $("#trxBlock").append('' +
            '<div class="input-field col s2 addedTrx'+ numFieldTrx +'">' +
            '<input name="transactions['+ numFieldTrx +'][trx]" id="trx'+ numFieldTrx +'" type="text" class="validate">' +
            '<label for="trx'+ numFieldTrx +'">Trx</label>' +
            '</div>' +
            '<div class="input-field col s4 addedTrx'+ numFieldTrx +'">' +
            '<input name="transactions['+ numFieldTrx +'][phone]" id="phone'+ numFieldTrx +'" type="text" class="validate">' +
            '<label for="phone'+ numFieldTrx +'">No. Telp</label>' +
            '</div> ' +
            '<div class="input-field col s3 addedTrx'+ numFieldTrx +'"> ' +
            '<select name="transactions['+ numFieldTrx +'][untuk]" id="untuk'+ numFieldTrx +'"> ' +
            '<option value="1">Kedoya</option> ' +
            '<option value="2">Biak</option> ' +
            '<option value="3">Daan Mogot</option> ' +
            '</select> ' +
            '<label>Untuk : </label> ' +
            '</div>' +
            '<div class="col s3 mb-50 addedTrx'+ numFieldTrx +'" name="addedTrx'+ numFieldTrx +'">' +
            '<a class="btn-floating btn waves-effect waves-light red darken-3 btnRemTrx'+ numFieldTrx +'" name="btnRemTrx'+ numFieldTrx +'" id="'+ numFieldTrx +'" title="Hapus"><i class="material-icons">remove</i></a>' +
            '</div>');
        $('select').material_select();
        numFieldTrx++;

        $('[name^=btnRemTrx]').click(function () {
            var numToRem = $(this).attr('id');
            var elm = ".addedTrx"+ numToRem;

            console.log(elm);

            $(elm).remove();
        });
    });

    var optionInventory = [];
    var optionUsers = [];
    var optionPosition = [];
    var optionDivision = [];
    var optionLocation = [];
    //$.ajax({
    //    url: './export-ajax',
    //    type: "GET",
    //    dataType: "json",
    //    success: function (datas) {
    //        var inventory = datas.inventory;
    //        var users = datas.users;
    //        var position = datas.position;
    //        var division = datas.division;
    //        var location = datas.location;
    //        for (var keysInv in inventory) {
    //            if (!inventory.hasOwnProperty(keysInv)) continue;
    //            var resInv = inventory[keysInv];
    //            optionInventory.push('<option value="' + resInv.id + '">' + resInv.id + ' - ' + parseCategory(resInv.idcategory) + ' (' + resInv.name + ')</option>');
    //        }
    //        for (var keys in users) {
    //            if (!users.hasOwnProperty(keys)) continue;
    //            var resUser = users[keys];
    //            optionUsers.push('<option value="' + resUser.iduser + '">' + resUser.name + ' - ' + resUser.position + '</option>');
    //        }
    //        for (var keysPosition in position) {
    //            if (!position.hasOwnProperty(keysPosition)) continue;
    //            var resPosition = position[keysPosition];
    //            optionPosition.push('<option value="' + resPosition.idposition + '">' + resPosition.name + '</option>');
    //        }
    //        for (var keysDivision in division) {
    //            if (!division.hasOwnProperty(keysDivision)) continue;
    //            var resDivision = division[keysDivision];
    //            optionDivision.push('<option value="' + resDivision.iddivsion + '">' + resDivision.name + '</option>');
    //        }
    //        for (var keysLocation in location) {
    //            if (!location.hasOwnProperty(keysLocation)) continue;
    //            var resLocation = location[keysLocation];
    //            optionLocation.push('<option value="' + resLocation.idoffice + '">' + resLocation.name + '</option>');
    //        }
    //    }
    //});

    $("#btnAddUserModal").click(function () {
        $("#userModalBlock").append('' +
            '<div class="file-field input-field col s12 m6 l4 addedTrx'+ numFieldTrx +'">' +
            '<input id="addName'+ numFieldTrx +'" name="user['+ numFieldTrx +'][name]" type="text" class="validate" placeholder="Nama User" required>' +
            '<label class="active" for="addName'+ numFieldTrx +'">Nama</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l3 addedTrx'+ numFieldTrx +'">' +
            '<select id="addUserPosition'+ numFieldTrx +'" name="user['+ numFieldTrx +'][position]">' +
            '<option value="" disabled selected>Pilih Posisi</option>' +
            optionPosition +
            '</select>' +
            '<label>Posisi</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l2 addedTrx'+ numFieldTrx +'">' +
            '<select id="addUserDivision'+ numFieldTrx +'" name="user['+ numFieldTrx +'][division]">' +
            '<option value="" disabled selected>Pilih Divisi</option>' +
            optionDivision +
            '</select>' +
            '<label>Divisi</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l2 addedTrx'+ numFieldTrx +'">' +
            '<select id="addUserLocation'+ numFieldTrx +'" name="user['+ numFieldTrx +'][location]">' +
            '<option value="" disabled selected>Pilih Lokasi</option>' +
            optionLocation +
            '</select>' +
            '<label>Lokasi</label>' +
            '</div>' +
            '<div class="col s1 mb-50 addedTrx'+ numFieldTrx +'" name="addedTrx'+ numFieldTrx +'">' +
            '<a class="btn-floating btn waves-effect waves-light red darken-3 btnRemTrx'+ numFieldTrx +'" name="btnRemTrx'+ numFieldTrx +'" id="'+ numFieldTrx +'" title="Hapus"><i class="material-icons">remove</i></a>' +
            '</div>');
        $('select').material_select();
        numFieldTrx++;

        $('[name^=btnRemTrx]').click(function () {
            var numToRem = $(this).attr('id');
            var elm = ".addedTrx"+ numToRem;

            console.log(elm);

            $(elm).remove();
        });
    });

    $("#btnAddInvTrx").click(function () {
        $("#trxBlock").append('' +
            '<div class="input-field col s5 addedTrx'+ numFieldTrx +'">' +
            '<select name="export['+ numFieldTrx +'][item]" id="item'+ numFieldTrx +'">' +
            '<option value="" disabled selected>Pilih Item</option>' +
            optionInventory +
            '</select>' +
            '<label>ID Inventory : </label>' +
            '</div>' +
            '<div class="input-field col s6 addedTrx'+ numFieldTrx +'">' +
            '<select name="export['+ numFieldTrx +'][user]" id="user'+ numFieldTrx +'">' +
            '<option value="" disabled selected>Pilih User</option>' +
            optionUsers +
            '</select>' +
            '<label>User : </label>' +
            '</div>' +
            '<div class="col s1 mb-50 addedTrx'+ numFieldTrx +'" name="addedTrx'+ numFieldTrx +'">' +
            '<a class="btn-floating btn waves-effect waves-light red darken-3 btnRemTrx'+ numFieldTrx +'" name="btnRemTrx'+ numFieldTrx +'" id="'+ numFieldTrx +'" title="Hapus"><i class="material-icons">remove</i></a>' +
            '</div>');
        $('select').material_select();
        numFieldTrx++;

        $('[name^=btnRemTrx]').click(function () {
            var numToRem = $(this).attr('id');
            var elm = ".addedTrx"+ numToRem;

            console.log(elm);

            $(elm).remove();
        });
    });

    $("#addItemButton").click(function () {
        $("#addItemBlock").append('' +
            '<div class="col s12 mt-20 border-bottom addItemContent'+ numFieldTrx +'">' +
            '<div class="input-field col s12 m6 l6">' +
            '<select id="addCategory'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][category]" required>' +
            '<option value="" disabled selected>Pilih Jenis Item</option>' +
            '<option value="1">Laptop</option>' +
            '<option value="2">Charger Laptop</option>' +
            '<option value="3">Mouse</option>' +
            '<option value="4">Headset</option>' +
            '<option value="5">Keyboard</option>' +
            '<option value="6">Monitor</option>' +
            '</select>' +
            '<label>Jenis Item</label>' +
            '</div>' +
            '<div class="file-field input-field col s12 m6 l6 mb-10">' +
            '<input id="addId'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][id]" type="text" class="validate" required>' +
            '<label for="addId'+ numFieldTrx +'">ID Inventory</label>' +
            '</div>' +
            '<div class="file-field input-field col s12">' +
            '<input id="addName'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][name]" type="text" class="validate" required>' +
            '<label for="addName'+ numFieldTrx +'">Nama</label>' +
            '</div>' +
            '<div class="file-field input-field col s12 m6 l6">' +
            '<input id="addSN'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][sn]" type="text" class="validate" required>' +
            '<label for="addSN'+ numFieldTrx +'">Serial Number</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l6">' +
            '<select id="addLokasi'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][lokasi]" required>' +
            '<option value="" disabled selected>Lokasi</option>' +
            '<option value="1">Central Park</option>' +
            '<option value="2">Kedoya</option>' +
            '</select>' +
            '<label>Jenis Item</label>' +
            '</div>' +
            '<div class="input-field col s12">' +
            '<textarea id="addNote'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][note]" class="materialize-textarea"></textarea>' +
            '<label for="addNote'+ numFieldTrx +'">Catatan</label>' +
            '</div>' +
            '<div class="input-field col s12 mb-20">' +
            '<a name="duplicateButton'+ numFieldTrx +'" id="'+ numFieldTrx +'" class="waves-effect waves-light btn orange darken-3 right ml-10">Duplicate</a>' +
            '<a name="remItemButton'+ numFieldTrx +'" id="'+ numFieldTrx +'" class="waves-effect waves-light btn red right disabled" disabled>Remove</a>' +
            '</div>' +
            '</div>' +
            '');
        $('select').material_select();
        numFieldTrx++;

        var remBtn = $('[name^=remItemButton]');

        remBtn.removeClass('disabled');
        remBtn.removeAttr('disabled');

        remBtn.click(function () {
            var numToRem = $(this).attr('id');
            var elm = ".addItemContent"+ numToRem;

            console.log(elm);

            $(elm).remove();
        });
    });

    //scrolling tabble

    $dayElement = $(day);
    $dayPos = $dayElement.position();

    var $homeTable = $('.home-table table');
    $tableParent = $homeTable.parent();

    var $table = $('.auto-scroll');
    if ($table.length > 0) {
        $.each($table, function () {
            var $self = $(this);
            var $parent = $self.parent();
            var width = $parent.outerWidth(true);
            var scrollSpeed = 50;
            $parent.css({
                overflow: 'auto'
            });

            $self.mousemove(function (e) {
                if (e.pageX >= $parent.offset().left && e.pageX <= $parent.offset().left + 100) {
                    $parent[0].scrollLeft -= scrollSpeed;
                } else if (e.pageX >= $parent.offset().left + width - 100 && e.pageX <= $parent.offset().left + width) {
                    $parent[0].scrollLeft += scrollSpeed;
                }
            });
        });
    }

    if ($homeTable.length > 0) {
        $.each($table, function () {
            $tableParent.scrollLeft($dayPos.left - (($tableParent.outerWidth(true) / 2) - ($dayElement.outerWidth(true) / 2)));
        });
    }

    var inputListGroup = $('.inputListGroup');
    var listGroup = $('.listGroup');
    var tbody = $('tbody');

    inputListGroup.hide();
    inputListGroup.attr("disabled", true);

    listGroup.click(function () {
        tbody.find('span').show();
        tbody.find('input').hide();
        tbody.find('input').attr("disabled", true);
        tbody.find('input').removeClass('blue-text');
        $(this).children('span').hide();
        $(this).children('input').show();
        $(this).children('input').addClass('blue-text');
        $(this).parent().children('td').children('input').attr("disabled", false);
    });

    inputListGroup.change(function(){
        $('#formListGroup').submit();
    });

    var myTable = "#myTable";
    if ($(myTable).length > 0){
        $(function(){
            $("#myTable").tablesorter();
        });
    }


    $('.icon_action').hover(function(){
        $(this).removeClass('grey-text');
        $(this).addClass('grey-text text-lighten-3');
    }, function(){
        $(this).removeClass('grey-text text-lighten-3');
        $(this).addClass('grey-text');
    });

    setTimeout(
        function()
        {
            var message = $('#message');
            if (message.text().indexOf('New Hire berhasil ditambah') == 0 ){
                window.location = '/inventory/new-hire';
            } else if (message.text().indexOf('Item berhasil di export, item updated..!!') == 0){
                window.location = '/inventory/export';
            } else if (message.text().indexOf('Item berhasil masuk ke Stock, item updated..!!') == 0){
                window.location = '/inventory/import';
            } else if (message.text().indexOf('User berhasil ditambah, user updated..!!') == 0){
                window.location = '/inventory/user';
            }

        }, 2000);

    $('.modal').modal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            opacity: .5, // Opacity of modal background
            inDuration: 300, // Transition in duration
            outDuration: 200, // Transition out duration
            startingTop: '4%', // Starting top style attribute
            endingTop: '10%' // Ending top style attribute
        }
    );
});

$(document).on('click', '.duplicateButton', function() {
    var idDuplicateBtn = $(this).attr('id');
    var id      = $('#addId'+ idDuplicateBtn).val();
    var jenis   = $('#addCategory'+ idDuplicateBtn).val();
    var nama    = $('#addName'+ idDuplicateBtn).val();
    var SN      = $('#addSN'+ idDuplicateBtn).val();
    var lokasi  = $('#addLokasi'+ idDuplicateBtn).val();
    var note    = $('#addNote'+ idDuplicateBtn).val();

    console.log(idDuplicateBtn);
    console.log(id);
    console.log(jenis);
    console.log(nama);
    console.log(SN);
    console.log(lokasi);
    console.log(note);

    var selDefault = "selected";
    var selLaptop = "";
    var selCharger = "";
    var selMouse = "";
    var selHS = "";
    var selKeyBoard = "";
    var selMonitor = "";
    var selCP = "";
    var selKedoya ="";

    switch (jenis) {
        case "1":
            selLaptop = "selected";
            break;
        case "2":
            selCharger = "selected";
            break;
        case "3":
            selMouse = "selected";
            break;
        case "4":
            selHS = "selected";
            break;
        case "5":
            selKeyBoard = "selected";
            break;
        case "6":
            selMonitor = "selected";
            break;
        default:
            selDefault = "selected";
    }

    switch (lokasi) {
        case "1":
            selCP = "selected";
            break;
        case "2":
            selKedoya = "selected";
            break;
        default:
            selDefault = "selected";
    }

    var appendStr = '' +
        '<div class="col s12 mt-20 border-bottom addItemContent'+ numFieldTrx +'">' +
        '<div class="input-field col s12 m6 l6">' +
        '<select id="addCategory'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][category]" required>' +
        '<option '+ selDefault +' value="" disabled>Pilih Jenis Item</option>' +
        '<option '+ selLaptop +' value="1">Laptop</option>' +
        '<option '+ selCharger +' value="2">Charger Laptop</option>' +
        '<option '+ selMouse +' value="3">Mouse</option>' +
        '<option '+ selHS +' value="4">Headset</option>' +
        '<option '+ selKeyBoard +' value="5">Keyboard</option>' +
        '<option '+ selMonitor +' value="6">Monitor</option>' +
        '</select>' +
        '<label>Jenis Item</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l6 mb-10">' +
        '<input id="addId'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][id]" type="text" class="validate" value="'+ id +'" required>' +
        '<label for="addId'+ numFieldTrx +'" class="active">ID Inventory</label>' +
        '</div>' +
        '<div class="file-field input-field col s12">' +
        '<input id="addName'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][name]" type="text" class="validate" value ="' + nama +'" required>' +
        '<label for="addName'+ numFieldTrx +'" class="active">Nama</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l6">' +
        '<input id="addSN'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][sn]" type="text" class="validate" value="'+ SN +'" required>' +
        '<label for="addSN'+ numFieldTrx +'" class="active">Serial Number</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l6">' +
        '<select id="addLokasi'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][lokasi]" required>' +
        '<option '+ selDefault +' value="" disabled>Lokasi</option>' +
        '<option '+ selCP +' value="1">Central Park</option>' +
        '<option '+ selKedoya +' value="2">Kedoya</option>' +
        '</select>' +
        '<label>Jenis Item</label>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="addNote'+ numFieldTrx +'" name="adds['+ numFieldTrx +'][note]" class="materialize-textarea">'+ note +'</textarea>' +
        '<label for="addNote'+ numFieldTrx +'" class="active">Catatan</label>' +
        '</div>' +
        '<div class="input-field col s12 mb-20">' +
        '<a name="duplicateButton'+ numFieldTrx +'" id="'+ numFieldTrx +'" class="duplicateButton waves-effect waves-light btn orange darken-3 right ml-10">Duplicate</a>' +
        '<a name="remItemButton'+ numFieldTrx +'" id="'+ numFieldTrx +'" class="waves-effect waves-light btn red right disabled" disabled>Remove</a>' +
        '</div>' +
        '</div>' +
        '';

    console.log(appendStr);

    $("#addItemBlock").append(appendStr);

    numFieldTrx++;

    var remBtn = $('[name^=remItemButton]');

    remBtn.removeClass('disabled');
    remBtn.removeAttr('disabled');

    remBtn.click(function () {
        var numToRem = $(this).attr('id');
        var elm = ".addItemContent"+ numToRem;

        console.log(elm);

        $(elm).remove();
    });

    $('select').material_select();
});

$(document).on('change', '[id=userPosition]', function() {
    var selectValue = $(this).val();
    var parentId = $(this).closest('.input-field').attr('id');
    if (selectValue == 0){
        $('#positionBlock').append('' +
            ' <div id="0" class="userPositionText file-field input-field col s12 mb-20"> ' +
                '<input id="userPositionText" name="user[0][position]" type="text" class="validate mb-10" required> ' +
                '<label for="userPositionText">Jabatan</label> ' +
                '<a name="cancelInputPosition" id=0 class="waves-effect btn red waves-light left">Cancel</a> ' +
            '</div>' +
            '');
        $('.userPositionSelect').remove();
    }
});
$(document).on('change', '[id=userDivision]', function() {
    var selectValue = $(this).val();
    var parentId = $(this).closest('.input-field').attr('id');
    console.log(selectValue);
    if (selectValue == 0){
        $('#divisionBlock').append('' +
            '<div id="0" class="userDivText file-field input-field col s12 mb-20">' +
                '<input id="userDivisionText" name="user[0][division]" type="text" class="validate mb-10" required>' +
                '<label for="userDivisionText">Divisi</label>' +
                '<a name="cancelInputDivision" id=0 class="waves-effect btn red waves-light left">Cancel</a>' +
            '</div>' +
            '');
        $('.userDivSelect').remove();
    }
});

$(document).on('click', '[name=cancelInputDivision], [name=cancelInputPosition]', function() {
    window.location = '/inventory/new-hire';
});