"use strict";
import RegionSelection from "./regionSelection";
import TroopSelection from "./troopSelection";
window.onload = () => {
	const regionSelector: RegionSelection = new RegionSelection();
	const troopSelector: TroopSelection = new TroopSelection(regionSelector);
	regionSelector.init();
	troopSelector.init();
};

