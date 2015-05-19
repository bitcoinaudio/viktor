'use strict';

var saveFile = require( "file-saver" ).saveAs;

module.exports = function( mod ) {

	mod.controller( "PatchLibraryCtrl", [ "$scope", "$modal", "dawEngine", "patchLibrary", function( $scope, $modal, dawEngine, patchLibrary ) {
		var self = this,
			selectedPatch = patchLibrary.getSelected(),
			customPatchNames = patchLibrary.getCustomNames();

		self.isSavePatchVisible = function() {
			return selectedPatch.isUnsaved ? true : false;
		};

		self.openSavePatchModal = function() {
			var modalInstance = $modal.open( {
				animation: $scope.animationsEnabled,
				templateUrl: 'savePatchModal.html',
				controller: 'SavePatchModalCtrl',
				controllerAs: 'savePatchModal',
				size: null,
				resolve: null
			} );

			modalInstance.result.then( function( name ) {
				patchLibrary.saveCustom( name, patchLibrary.getSelected().patch );
			}, function() {} );
		};

		self.isDeletePatchVisible = function() {
			return selectedPatch.isCustom ? true : false;
		};

		self.openDeletePatchModal = function() {
			var modalInstance = $modal.open( {
				animation: $scope.animationsEnabled,
				templateUrl: 'deletePatchModal.html',
				controller: 'DeletePatchModalCtrl',
				controllerAs: 'deletePatchModal',
				size: null,
				resolve: null
			} );

			modalInstance.result.then( function() {
				patchLibrary.removeCustom( selectedPatch.name );
			}, function() {} );
		};

		self.upload = function( files ) {
			if ( files.length ) {
				var reader = new FileReader();

				reader.onload = function(e) {
					var text = reader.result,
						customPatches;

					try {
						customPatches = JSON.parse( text );
					} catch ( exception ) {}

					if ( customPatches ) {
						patchLibrary.overrideCustomLibrary( customPatches );
					}
				}

				reader.readAsText( files[ 0 ], "utf-8" );
			}
		};

		self.clear = function() {
			patchLibrary.overrideCustomLibrary( {} );
		};

		self.isExportVisible = function() {
			return customPatchNames.length > 0;
		};

		self.export = function() {
			var data = new Blob( [ JSON.stringify( patchLibrary.customPatches ) ], { type: "text/plain;charset=utf-8" } );

			saveFile( data, "viktor-custom-patches.json" );
		};

		patchLibrary.onSelectionChange( function( newSelectedPatch ) {
			selectedPatch = newSelectedPatch;
			customPatchNames = patchLibrary.getCustomNames();

			dawEngine.loadPatch( selectedPatch.patch );
		} );
	} ] );

	mod.controller( "SavePatchModalCtrl", [ "$modalInstance", "patchLibrary", function( $modalInstance, patchLibrary ) {
		var self = this;

		self.name = patchLibrary.getUniqueName();

		self.close = function() {
			$modalInstance.dismiss();
		};

		self.savePatch = function() {
			$modalInstance.close( self.name );
		};
	} ] );

	mod.controller( "DeletePatchModalCtrl", [ "$modalInstance", function( $modalInstance ) {
		var self = this;

		self.close = function() {
			$modalInstance.dismiss();
		};

		self.deletePatch = function() {
			$modalInstance.close();
		};
	} ] );

	mod.directive( "patchLibrary", [ "$templateCache", function( $templateCache ) {
		return {
			restrict: "E",
			replace: true,
			template: $templateCache.get( "patch-library.html" )
		};
	} ] );

	mod.directive( "autofocus", function() {
		return {
			restrict: "A",
			link: function ( scope, element ) {
				element[0].focus();
			}
		};
	} );

};