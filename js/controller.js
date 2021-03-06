/**
 * MonevController.js
 *
 * UnitedVision. 2015
 * Manado, Indonesia.
 * dkakunsi.unitedvision@gmail.com
 * 
 * Created by Deddy Christoper Kakunsi
 * Manado, Indonesia.
 * deddy.kakunsi@gmail.com | deddykakunsi@outlook.com
 * 
 * Version: 1.0.0
 */

$( document ).ready( function () {

	aplikasiRestAdapter.findKode( function( result ) {
		kodeAplikasi = result.object;
	});


	if ( !operator.isAuthorized() ) {
		window.location.href = 'login.html';
		return;
	}
	
	resetStorage();

	page.change( $( '#operator-nama' ), operator.getName() );
	page.setName( 'HOME' );
	
	message.writeLog( "Username: " + operator.getUsername() ); // LOG
	var navDef = navigation( operator.getUsername() == 'superuser' ? 'ADMIN' : operator.getRole() );
	page.change( $( '#nav-menu' ), navDef );

	$( function () {
		$( '[ data-toggle = "tooltip" ]' ).tooltip();
	} );

	
	
	// Menu Handlers
	$( document ).on( 'click', '#menu-program', function() {

		page.change( $( '#message' ), '');
		programDomain.reload();

	} );

	$( document ).on( 'click', '#menu-kegiatan', function() {

		page.change( $( '#message' ), '');
		kegiatanDomain.reload();
		
	} );

	$( document ).on( 'click', '#menu-rekap', function() {
		page.change( $( '#message' ), '');
		rekapDomain.reload();
	} );

	$( document ).on( 'click', '#nav-logout', function() {
		
		page.change( $( '#message' ), '');
		monevRestAdapter.logout();

	} );

	$( document ).on( 'click', '#btn-ubah-password', function() {

		var password = $( '#form-password' ).val();
		var pegawai = operator.getPegawai();

		pegawaiRestAdapter.updatePassword( pegawai.id, password, function( result ) {
			message.success( result );
		} );
	} );
	
	
	
	// Table Handler
	$( document ).on( 'click', '#prev', function() {
	
		var pageNumber = $( '#pageNumber' ).text();
		var previousPage = parseInt( pageNumber  ) - 1;
		
		if ( previousPage < 1 )
			previousPage = 1;
		
		activeContainer.content.setData( activeContainer.list, previousPage );
	
		page.change( $( '#pageNumber' ), previousPage );
		page.change( $( '#message' ), '');
		
	} );
	
	$( document ).on( 'click', '#next', function() {
	
		var pageNumber = $( '#pageNumber' ).text();
		var nextPage = parseInt( pageNumber ) + 1;

		var lastPage = activeContainer.list.length / set;
		if ( nextPage > lastPage ) {
			nextPage = Math.floor( lastPage );
			
			if ( ( nextPage * set ) < activeContainer.list.length )
				nextPage = nextPage + 1;
			
		}

		activeContainer.content.setData( activeContainer.list, nextPage );
	
		page.change( $( '#pageNumber' ), nextPage );
		page.change( $( '#message' ), '');
		
	} );

	
	
	// Program Handler
	$( document ).on( 'click', '#btn-program-tambah', function() {

		page.change( $( '#message' ), '');
		programDomain.currentId = 0;
		$( '#form-program-satuan-kerja' ).val( '' );
		$( '#form-program-nama' ).val( '' );
		$( '#form-program-tahun-awal' ).val( '' );
		$( '#form-program-tahun-akhir' ).val( '' );
		
		if ( operator.getRole() == 'OPERATOR' ) {
			var satuanKerja = operator.getSatuanKerja();
			
			$( '#form-program-satuan-kerja' ).val( satuanKerja.nama );
			
			// set for-program-satuan-kerja as readonly
			// $( '#form-program-satuan-kerja' ).addAttr( 'readonly' );
		}
		
	} );
	
	$( document ).on( 'click', '#btn-program-simpan', function() {

		var id = programDomain.currentId;
		var parent = storage.getByNama( programDomain, $( '#form-program-program' ).val() );
		var satker = storage.getByNama( satkerDomain, $( '#form-program-satuan-kerja' ).val() );
		var nama = $( '#form-program-nama' ).val();
		var tahunAwal = $( '#form-program-tahun-awal' ).val();
		var tahunAkhir = $( '#form-program-tahun-akhir' ).val();
	
		programRestAdapter.save( satker.id, id, nama, tahunAwal, tahunAkhir, parent, programDomain.success );
	} );

	$( document ).on( 'change', '#txt-program-satuan-kerja', function() {
		
		page.change( $( '#message' ), '');
		var satker = storage.getByNama( satkerDomain, $( '#txt-program-satuan-kerja' ).val() );
		
		programRestAdapter.findBySatker( satker.id, function( result ) {
			programDomain.load( result.list );
		});
	} );


	
	// Kegiatan handler.
	$( document ).on( 'click', '#btn-kegiatan-tambah', function() {

		page.change( $( '#message' ), '');
		kegiatanDomain.currentId = 0;
		kegiatanDomain.currentParentId = 0;
		$( '#form-kegiatan-program' ).val( '' );
		$( '#form-kegiatan-nama' ).val( '' );
		$( '#form-kegiatan-anggaran' ).val( '' );
		
	} );
	
	$( document ).on( 'click', '#btn-kegiatan-simpan', function() {

		var id = kegiatanDomain.currentId;
		var idParent = kegiatanDomain.currentParentId;

		var program = storage.getByNama( programDomain, $( '#form-kegiatan-program' ).val());
		var nama = $( '#form-kegiatan-nama' ).val();
		var paguAnggaran = $( '#form-kegiatan-anggaran' ).val();

		if ( idParent == 0 ) {
			kegiatanRestAdapter.save( program.id, id, nama, paguAnggaran, kegiatanDomain.success );
		} else {
			kegiatanRestAdapter.addSub( idParent, id, nama, paguAnggaran, kegiatanDomain.success );
		}
	} );

	$( document ).on( 'change', '#txt-kegiatan-satuan-kerja', function() {
		
		page.change( $( '#message' ), '');
		var satker = storage.getByNama( satkerDomain, $( '#txt-kegiatan-satuan-kerja' ).val() );
		
		kegiatanRestAdapter.findBySatker( satker.id, function( result ) {
			kegiatanDomain.load( result.list );
		});
	} );

	/* Pelajari dan implementasi pipeline */
	$( document ).on( 'click', '#btn-realisasi-simpan', function() {

		var idKegiatan = kegiatanDomain.currentId;
		var tahun = $( '#form-realisasi-tahun' ).val();
		var bulan = $( '#form-realisasi-bulan' ).val();
		var rencana = $( '#form-realisasi-rencana' ).val();

		var realisasiAnggaran = $( '#form-realisasi-anggaran' ).val();
		if ( realisasiAnggaran == '' )
			realisasiAnggaran = 0;
		anggaranRestAdapter.save( idKegiatan, tahun, bulan, rencana, realisasiAnggaran, function( result ) { });

		var realisasiFisik = $( '#form-realisasi-fisik' ).val();
		if ( realisasiFisik == '' )
			realisasiFisik = 0;
		fisikRestAdapter.save( idKegiatan, 0, tahun, bulan, realisasiFisik, kegiatanDomain.success );
		
	} );
	
	$( document ).on( 'click', '#btn-realisasi-anggaran', function() {
		var idAnggaran = kegiatanDomain.currentIdAnggaran;
		var realisasi = $( '#form-realisasi-anggaran-realisasi' ).val();
		
		anggaranRestAdapter.realisasi( idAnggaran, realisasi, kegiatanDomain.success );
		
	} );

	$( document ).on( 'click', '#btn-realisasi-fisik', function() {
		var idKegiatan = kegiatanDomain.currentId;
		var id = kegiatanDomain.currentIdFisik;
		var tahun = $( '#form-realisasi-fisik-tahun' ).val();
		var bulan = $( '#form-realisasi-fisik-bulan' ).val();
		var realisasi = $( '#form-realisasi-fisik-realisasi' ).val();
		
		fisikRestAdapter.save( idKegiatan, id, tahun, bulan, realisasi, function( result ) {
			message.success( result );
			kegiatanDomain.reload();
		});
	} );

	$( document ).on( 'click', '#btn-realisasi-foto', function() {
		throw new Error( 'Not yet implemented' );
	} );

	$( document ).on( 'click', '#tab-anggaran', function() {

		$( '#table-anggaran-header' ).show();
		$( '#table-anggaran' ).show();
		$( '#table-fisik-header' ).hide();
		$( '#table-fisik' ).hide();
		$( '#tab-anggaran' ).addClass( 'active' );
		$( '#tab-fisik' ).removeClass( 'active' );
	
		var id = kegiatanDomain.currentId;
	
		anggaranRestAdapter.findByKegiatan( id, function( result ) {
			var listAnggaran = result.list;
			kegiatanDomain.content.loadAnggaran( listAnggaran );
		});
	} );

	$( document ).on( 'click', '#tab-fisik', function() {

		$( '#table-anggaran-header' ).hide();
		$( '#table-anggaran' ).hide();
		$( '#table-fisik-header' ).show();
		$( '#table-fisik' ).show();
		$( '#tab-anggaran' ).removeClass( 'active' );
		$( '#tab-fisik' ).addClass( 'active' );
	
		var id = kegiatanDomain.currentId;

		fisikRestAdapter.findByKegiatan( id, function( result ) {
			var listFisik = result.list;
			kegiatanDomain.content.loadFisik( listFisik );
		});
	} );

	
	
	// Rekap Handler
	$( document ).on( 'click', '#btn-rekap-program', function() {
		$( '#form-rekap-program-tahun' ).val( '' );
		$( '#form-rekap-program-kode' ).val( '' );
	});
	
	$( document ).on( 'click', '#btn-cetak-rekap-program', function() {
		var tahun = $( '#form-rekap-program-tahun' ).val();
		var kode = $( '#form-rekap-program-kode' ).val();
		
		printer.submitPost( target + '/monev/program/rekap/tahun/' + tahun + '/satker/' + kode + '/cetak', null, 'GET' );
	});
	
	$( document ).on( 'click', '#btn-rekap-kegiatan', function() {
		$( '#form-rekap-kegiatan-tanggal-awal' ).val( '' );
		$( '#form-rekap-kegiatan-tanggal-akhir' ).val( '' );
	});
	
	$( document ).on( 'click', '#btn-cetak-rekap-kegiatan', function() {
		var tahun = $( '#form-rekap-kegiatan-tahun' ).val();
		var bulan = $( '#form-rekap-kegiatan-bulan' ).val();
		
		printer.submitPost( target + '/monev/kegiatan/rekap/tahun/' + tahun + '/bulan/' + bulan + '/cetak', null, 'GET' );
	});

	
	
	// Cari Handler.
	$( document ).on( 'focus', '#search', function() {
	
		$( '#search' ).attr( 'placeholder', 'Masukan Kata Kunci' );
		page.change( $( '#table' ), '' );
		page.change( $( '#message' ), '');
		
	} );
	
	$( document ).on( 'blur', '#search', function() {
	
		$( '#search' ).attr( 'placeholder', 'Cari...' );
		$( '#search' ).val( '' );
		
	} );
	
	$( document ).on( 'change', '#search', function() {
	
		var kataKunci = $( '#search' ).val();
		var halaman = page.getName();
		
		if ( !halaman )
			
			throw new Error( 'Nama halaman belum di atur' );
		
		if ( halaman == programDomain.nama ) {

			programRestAdapter.search( kataKunci, function( result ) {
				programDomain.load( result.list );
			});
			
		} else if ( halaman == kegiatanDomain.nama ) {
		
			kegiatanRestAdapter.search( kataKunci, function( result ) {
				kegiatanDomain.load( result.list );
			});
			
		} else {

			throw new Error( 'Nama halaman tidak terdaftar : ' + halaman );
			
		}
	} );


	
	// Alert auto-close
	$("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
	$("#warning-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
	$("#error-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
} );


function resetStorage() {

	unitKerjaRestAdapter.all( function( result ) {
		storage.set( ( result ? result.list : [] ), satkerDomain.nama );
	});
};

function navigation( role ) {

	if ( role == "ADMIN" || role == "OPERATOR" ) {
		
		return '' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-program" href="#" data-toggle="tooltip" data-placement="right" title="Program"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Program</b></a></li>' +
			'<li><a id="menu-kegiatan" href="#" data-toggle="tooltip" data-placement="right" title="Kegiatan"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Kegiatan</b></a></li>' +
			'<li><a id="menu-rekap" href="#" data-toggle="tooltip" data-placement="right" title="Rekap"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Rekap</b></a></li>';

	} else {
		throw new Error( "Role: '" + role + "' is unknown" );
	}
};
