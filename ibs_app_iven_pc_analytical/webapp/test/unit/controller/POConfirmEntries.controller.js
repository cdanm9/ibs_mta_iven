/*global QUnit*/

sap.ui.define([
	"comibs/ibs_app_iven_pc_analytical/controller/POConfirmEntries.controller"
], function (Controller) {
	"use strict";

	QUnit.module("POConfirmEntries Controller");

	QUnit.test("I should test the POConfirmEntries controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
