$(document).ready(function() {
    $(".sidenav").sidenav();
    $('.collapsible').collapsible(
        {hover: false}
    );
    $('.tabs').tabs();
    $('select').formSelect();
    $('.datepicker').datepicker({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        autoClose: true,
        closeOnSelect: true // Close upon selecting a date,
    });
    $('.tooltipped').tooltip({delay: 50});

    $('.modal').modal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            opacity: .5, // Opacity of modal background
            inDuration: 300, // Transition in duration
            outDuration: 200, // Transition out duration
            startingTop: '4%', // Starting top style attribute
            endingTop: '10%' // Ending top style attribute
        }
    );

    $("#downloadCsv").click(function () {
        var $table = "";
        if ($("#checkDetail").prop('checked')) {
            $table = $("#detailTable");
        }else{
            $table = $("#rekapTable");
        }
        var csv = $table.table2CSV({
            delivery: 'value'
        });
        window.location.href = 'data:text/csv;charset=UTF-8,'
            + encodeURIComponent(csv);
    });
});

function newUserBundle(){
    $(document).on('change', 'select[id^=detailPilihAkses]', function() {
        var selectVal = $(this).val();
        $(this).parent('div').parent('div').parent('div').find('input[id^=detailSalesCode], input[id^=detailZohoRole], input[id^=detailPortalRole]').attr('disabled',true).addClass('disabled');
        if(jQuery.inArray('Zoho',selectVal) !== -1 && jQuery.inArray('Portal',selectVal) !== -1){
            $(this).parent('div').parent('div').parent('div').find('input[id^=detailSalesCode], input[id^=detailZohoRole], input[id^=detailPortalRole]').attr('disabled',false).removeClass('disabled');
        }else if(jQuery.inArray('Zoho',selectVal) !== -1 && jQuery.inArray('Portal',selectVal) == -1) {
            $(this).parent('div').parent('div').parent('div').find('input[id^=detailZohoRole]').attr('disabled',false).removeClass('disabled');
        }else if(jQuery.inArray('Zoho',selectVal) == -1 && jQuery.inArray('Portal',selectVal) !== -1) {
            $(this).parent('div').parent('div').parent('div').find('input[id^=detailSalesCode],input[id^=detailPortalRole]').attr('disabled',false).removeClass('disabled');
        }else{
            $(this).parent('div').parent('div').parent('div').find('input[id^=detailSalesCode], input[id^=detailZohoRole], input[id^=detailPortalRole]').attr('disabled',true).addClass('disabled');
        }
    });

    var userNum = 1;
    $('#btnAddUser').click(function() {
        var divBlock = $('#newUserBlock');
        var userContent = '' +
            '<div class="addedUserContent'+ userNum +'">' +
            '<div class="col s12 border-bottom mt-20"></div>' +
            '<div class="input-field col s12 m6 l3">' +
            '<input id="detailNama'+ userNum +'" name="detail['+ userNum +'][nama]" type="text" class="validate" required>' +
            '<label for="detailNama'+ userNum +'">Nama User</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l3">' +
            '<input id="detailEmail'+ userNum +'" name="detail['+ userNum +'][email]" type="email" class="validate" required>' +
            '<label for="detailEmail'+ userNum +'">Email Pribadi</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l3">' +
            '<input id="detailDivisi'+ userNum +'" name="detail['+ userNum +'][divisi]" type="text" class="validate" required>' +
            '<label for="detailDivisi'+ userNum +'">Divisi User</label>' +
            '</div>' +
            '<div class="input-field col s12 m6 l3">' +
            '<input id="detailJabatan'+ userNum +'" name="detail['+ userNum +'][jabatan]" type="text" class="validate" required>' +
            '<label for="detailJabatan'+ userNum +'">Jabatan User</label>' +
            '</div>' +
            '<div class="input-field col s12 l3">' +
            '<select id="detailPilihAkses'+ userNum +'" name="detail['+ userNum +'][akses]" multiple required>' +
            '<option value="" disabled selected>Pilih Akses yang Dibutuhkan</option>' +
            '<option value="Zoho">Zoho</option>' +
            '<option value="Portal">Portal</option>' +
            '<option value="Telpon">Telpon</option>' +
            '<option value="Email Cermati">Email Cermati</option>' +
            '<option value="Email Indodana">Email Indodana</option>' +
            '<option value="Keystone">Keystone</option>' +
            '<option value="Basecamp">Basecamp</option>' +
            '</select>' +
            '<label for="detailPilihAkses'+ userNum +'">Kebutuhan Akses</label>' +
            '</div>' +
            '<div class="input-field col s12 m12 l3">' +
            '<input id="detailSalesCode'+ userNum +'" name="detail['+ userNum +'][salesCode]" type="text" class="validate disabled" required disabled>' +
            '<label for="detailSalesCode'+ userNum +'">Sales Code</label>' +
            '</div>' +
            '<div class="input-field col s12 m12 l3">' +
            '<input id="detailZohoRole'+ userNum +'" name="detail['+ userNum +'][zohoRole]" type="text" class="validate disabled" required disabled>' +
            '<label for="detailZohoRole'+ userNum +'">Role Zoho</label>' +
            '</div>' +
            '<div class="input-field col s12 m12 l3">' +
            '<input id="detailPortalRole'+ userNum +'" name="detail['+ userNum +'][portalRole]" type="text" class="validate disabled" required disabled>' +
            '<label for="detailPortalRole'+ userNum +'">Role Portal</label>' +
            '</div>' +
            '<div class="input-field col s12">' +
            '<textarea id="detailCatatan'+ userNum +'" name="detail['+ userNum +'][catatan]" class="materialize-textarea"></textarea>' +
            '<label for="detailCatatan'+ userNum +'">Catatan Tambahan (Opsional)</label>' +
            '</div>' +
            '<div class="col s12 right">' +
            '<a name="btnDelUser" id="'+ userNum +'" class="btn waves-effect waves-light white-text red right" title="Hapus User">Hapus User</a>' +
            '</div>' +
            '</div>' +
            '';
        $(divBlock).append(userContent);
        $('select').formSelect();
        userNum++;

        $('[name^=btnDelUser]').click(function () {
            var numToRem = $(this).attr('id');
            var elm = ".addedUserContent"+ numToRem;

            console.log(elm);

            $(elm).remove();
        });
    });
}

$(document).on('change', 'select[id=laporjenis]', function() {
    var existingContent = $('#templateContent');
    var divBlock = $('#templateBlock');
    var laporBody = $('#laporPageBody');
    $(laporBody).removeClass('container');
    $(laporBody).removeClass('almost-full');
    var newMember = "" +
        '<div id="templateContent">' +
        '<div class="col s12 center blue"><span class="white-text center-align">Data Atasan</span></div>' +
        '<div class="input-field col s12 m6 l6">' +
        '<input id="laporname" name="lapor[nama]" type="text" class="validate" required>' +
        '<label for="laporname">Nama Atasan</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l6">' +
        '<input id="lapordivisi" name="lapor[divisi]" type="text" class="validate" required>' +
        '<label for="lapordivisi">Divisi Atasan</label>' +
        '</div>' +
        '<div class="col s12 center blue"><span class="white-text center-align">Data User Baru</span></div>' +
        '<div class="row">' +
        '<div class="col s12" id="newUserBlock">' +
        '<div class="newUserContent">' +
        '<div class="input-field col s12 m6 l3">' +
        '<input id="detailNama0" name="detail[0][nama]" type="text" class="validate" required>' +
        '<label for="detailNama0">Nama User</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l3">' +
        '<input id="detailEmail0" name="detail[0][email]" type="email" class="validate" required>' +
        '<label for="detailEmail0">Email Pribadi</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l3">' +
        '<input id="detailDivisi0" name="detail[0][divisi]" type="text" class="validate" required>' +
        '<label for="detailDivisi0">Divisi User</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l3">' +
        '<input id="detailJabatan0" name="detail[0][jabatan]" type="text" class="validate" required>' +
        '<label for="detailJabatan0">Jabatan User</label>' +
        '</div>' +
        '<div class="input-field col s12 l3">' +
        '<select id="detailPilihAkses0" name="detail[0][akses]" multiple required>' +
        '<option value="" disabled selected>Pilih Akses yang Dibutuhkan</option>' +
        '<option value="Zoho">Zoho</option>' +
        '<option value="Portal">Portal</option>' +
        '<option value="Telpon">Telpon</option>' +
        '<option value="Email Cermati">Email Cermati</option>' +
        '<option value="Email Indodana">Email Indodana</option>' +
        '<option value="Keystone">Keystone</option>' +
        '<option value="Basecamp">Basecamp</option>' +
        '</select>' +
        '<label for="detailPilihAkses0">Kebutuhan Akses</label>' +
        '</div>' +
        '<div class="input-field col s12 m12 l3">' +
        '<input id="detailSalesCode0" name="detail[0][salesCode]" type="text" class="validate disabled" required disabled>' +
        '<label for="detailSalesCode0">Sales Code</label>' +
        '</div>' +
        '<div class="input-field col s12 m12 l3">' +
        '<input id="detailZohoRole0" name="detail[0][zohoRole]" type="text" class="validate disabled" required disabled>' +
        '<label for="detailZohoRole0">Role Zoho</label>' +
        '</div>' +
        '<div class="input-field col s12 m12 l3">' +
        '<input id="detailPortalRole0" name="detail[0][portalRole]" type="text" class="validate disabled" required disabled>' +
        '<label for="detailPortalRole0">Role Portal</label>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="detailCatatan0" name="detail[0][catatan]" class="materialize-textarea"></textarea>' +
        '<label for="detailCatatan0">Catatan Tambahan (Opsional)</label>' +
        '</div>' +
        '</div>' +
        '<div class="col s12 right">' +
        '<a id="btnAddUser" class="btn waves-effect waves-light white-text light-green right" title="Tambah User">Tambah User</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="input-field col s12 mb-20">' +
        '<button type="submit" value="newMember" name="laporsubmit" id="0" class="waves-effect waves-light btn blue darken-3 right ml-10">Kirim</button>' +
        '</div>' +
        '</div>' +
        "";
    var other = '' +
        '<div id="templateContent">' +
        '<div class="file-field input-field col s12 m6 l4">' +
        '<input id="laporname" name="lapor[nama]" type="text" class="validate" required>' +
        '<label for="laporname">Nama Anda</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l4">' +
        '<input id="lapordivisi" name="lapor[divisi]" type="text" class="validate" required>' +
        '<label for="lapordivisi">Divisi</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l3">' +
        '<select id="lokasi" name="lapor[lokasi]" required>' +
        '<option value="" disabled selected>Pilih Lokasi</option>' +
        '<option value="Daan Mogot">Daan Mogot</option>' +
        '<option value="Bandung">Bandung</option>' +
        '<option value="Surabaya">Surabaya</option>' +
        '<option value="Kedoya 1">Kedoya 1</option>' +
        '<option value="Kedoya 2">Kedoya 2</option>' +
        '<option value="Kedoya 3">Kedoya 3</option>' +
        '</select>' +
        '<label>Lokasi</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l1">' +
        '<input id="laporLantai" name="lapor[lantai]" type="text" class="validate" required>' +
        '<label for="laporLantai">Lantai</label>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="lapordetail" name="lapor[detail]" class="materialize-textarea" required></textarea>' +
        '<label for="lapordetail">Detail Permintaan</label>' +
        '</div>' +
        '<div class="input-field col s12 mb-20">' +
        '<button type="submit" value="other" name="laporsubmit" id="0" class="waves-effect waves-light btn blue darken-3 right ml-10">Kirim</button>' +
        '</div>' +
        '</div>' +
        '';

    var lastOther = '' +
        '<div id="templateContent">' +
        '<div class="file-field input-field col s12 m6 l4">' +
        '<input id="laporname" name="lapor[nama]" type="text" class="validate" required>' +
        '<label for="laporname">Nama Anda</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l4">' +
        '<input id="lapordivisi" name="lapor[divisi]" type="text" class="validate" required>' +
        '<label for="lapordivisi">Divisi</label>' +
        '</div>' +
        '<div class="input-field col s12 m6 l3">' +
        '<select id="lokasi" name="lapor[lokasi]" required>' +
        '<option value="" disabled selected>Pilih Lokasi</option>' +
        '<option value="Daan Mogot">Daan Mogot</option>' +
        '<option value="Bandung">Bandung</option>' +
        '<option value="Surabaya">Surabaya</option>' +
        '<option value="Kedoya 1">Kedoya 1</option>' +
        '<option value="Kedoya 2">Kedoya 2</option>' +
        '<option value="Kedoya 3">Kedoya 3</option>' +
        '</select>' +
        '<label>Lokasi</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l1">' +
        '<input id="laporLantai" name="lapor[lantai]" type="text" class="validate" required>' +
        '<label for="laporLantai">Lantai</label>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="lapordetail" name="lapor[detail]" class="materialize-textarea" required></textarea>' +
        '<label for="lapordetail">Detail Permintaan</label>' +
        '</div>' +
        '<div class="input-field col s12 mb-20">' +
        '<button type="submit" value="lastOther" name="laporsubmit" id="0" class="waves-effect waves-light btn blue darken-3 right ml-10">Kirim</button>' +
        '</div>' +
        '</div>' +
        '';

    var resign = '' +
        '<div id="templateContent">' +
        '<div class="file-field input-field col s12 m6 l6">' +
        '<input id="laporname" name="lapor[nama]" type="text" class="validate" required>' +
        '<label for="laporname">Nama SPV</label>' +
        '</div>' +
        '<div class="file-field input-field col s12 m6 l6">' +
        '<input id="lapordivisi" name="lapor[divisi]" type="text" class="validate" required>' +
        '<label for="lapordivisi">Divisi SPV</label>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="lapordetail" name="lapor[detail]" class="materialize-textarea" placeholder="Jelaskan detail data anaknya.." required></textarea>' +
        '<label for="lapordetail" class="active">Data Anak Resign</label>' +
        '</div>' +
        '<div class="input-field col s12 mb-20">' +
        '<button type="submit" value="resign" name="laporsubmit" id="0" class="waves-effect waves-light btn blue darken-3 right ml-10">Kirim</button>' +
        '</div>' +
        '</div>' +
        '';
    if($(existingContent).length > 0){
        $(existingContent).remove();
    }

    switch ($(this).val()){
        case '1' :
            $(divBlock).append(newMember);
            newUserBundle();
            $(laporBody).addClass('almost-full');
            break;
        case '4' :
            $(divBlock).append(resign);
            $(laporBody).addClass('container');
            break;
        case '11' :
            $(divBlock).append(lastOther);
            $(laporBody).addClass('container');
            break;
        default :
            $(divBlock).append(other);
            $(laporBody).addClass('container');
            break;
    }
    $('select').formSelect();

});
$(document).on('change', 'input[id^=checkDetail]', function() {
    if ($(this).prop('checked')){
        $("#rekapTable").addClass('hide');
        $("#detailTable").removeClass('hide');
    }else{
        $("#rekapTable").removeClass('hide');
        $("#detailTable").addClass('hide');
    }
});

$(document).on('change', '[id^=privilegeUser]', function() {
    var selectValue = $(this).val();
    var parentId = $(this).closest('.input-field').attr('data-text');
    //console.log(selectValue);
    $('#hiddenPriv-'+parentId).val(selectValue);
});

$(document).on('change', '[id^=jobUser]', function() {
    var selectValue = $(this).val();
    var parentId = $(this).closest('.input-field').attr('data-text');
    //console.log(selectValue);
    $('#hiddenJob-'+parentId).val(selectValue);
});
