import ArmySelection from "./armySelection";
import RegionSelection from "./regionSelection";
import TroopSelection from "./troopSelection";
import Unit from "./models/unit";
import SelectedUnit from "./models/selectedUnit";
import Option from "./models/option";
import SelectedTerrain from "./models/selectedTerrain";
import UnitSelection from "./models/unitSelection";

const RESTRICTED_CHARIOT_RACES: Array<string> = ['Dwarf', 'Elf', 'Goblin', 'Human', 'Orc'];

class Chariots {
    private armySelection: ArmySelection;
    private regionSelection: RegionSelection;
    private troopSelection: TroopSelection;

    constructor(armySelection: ArmySelection, regionSelection: RegionSelection, troopSelection: TroopSelection) {
        this.armySelection = armySelection;
        this.regionSelection = regionSelection;
        this.troopSelection = troopSelection;
    }
    
    isChariotAvailable (unit: Unit): boolean {
        let chariotRace: string = '';
        let availableChariots = 0;
        let usedChariots = 0;
        if(RESTRICTED_CHARIOT_RACES.some((race: string) => {
            if (unit.name.includes(race)) {
                chariotRace = race;
                return true;
            }
            return false;
        })) {
            this.regionSelection.getChosenTerrains().forEach((terrain: SelectedTerrain) => {
                if (terrain.terrain.troops) {
                    terrain.terrain.troops.forEach((unitSelection: UnitSelection) => {
                        if (unitSelection.name.includes(chariotRace) && unitSelection.name.includes('Chariot')) {
                            availableChariots += unitSelection.count;
                        }
                    });
                }
            });
            if (availableChariots === 0) {
                return false;
            }
            this.armySelection.getSelectedUnits().forEach((selectedUnit: SelectedUnit) => {
                if (selectedUnit.unit.name.includes(chariotRace)) {
                    if (selectedUnit.unit.name.includes('Chariot')) {
                        usedChariots += selectedUnit.quantity;
                    } else if (selectedUnit.selectedOptions.some((selectedOption: Option) => selectedOption.name.includes('Chariot'))) {
                        usedChariots ++;
                    }
                }
            });
            return usedChariots < availableChariots;
        }
        return false;
    }
}

export default Chariots;