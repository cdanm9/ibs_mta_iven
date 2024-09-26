/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comibs/ibs_app_iven_pc_analytical/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
