import * as dwarfTerrains from "./terrains/dwarfTerrains.json";
import * as humanTerrains from "./terrains/humanTerrains.json";
import * as elfTerrains from "./terrains/elfTerrains.json";
import * as orcTerrains from "./terrains/orcTerrains.json";
import * as goblinTerrains from "./terrains/goblinTerrains.json";
import * as unalignedTerrains from "./terrains/unalignedTerrains.json";
import ArmySelection from "./armySelection";
import RegionSelection from "./regionSelection";
import Terrain from "./models/terrain";
import SelectedTerrain from "./models/selectedTerrain";
import Unit from "./models/unit";
import UnitSelection from "./models/unitSelection";
import SelectedUnit from "./models/selectedUnit";

const MAX_SAME_UNITS: number = 4;

class TroopSelection {
    private regionSelection: RegionSelection;
    public armySelection: ArmySelection;
    private terrainLists: Array<Array<Terrain>>;
    private availableDwarfs: Array<Unit>;
    private availableHumans: Array<Unit>;
    private availableElfs: Array<Unit>;
    private availableOrcs: Array<Unit>;
    private availableGoblins: Array<Unit>;
    private availableUndead: Array<Unit>;
    private availableUnaligned: Array<Unit>;
    private pureAvailableTroops: Array<Unit>;
    private eitherTroops: Array<UnitSelection>;

    constructor(regionSelection: RegionSelection) {
        this.regionSelection = regionSelection
        this.terrainLists = [dwarfTerrains.list, humanTerrains.list, elfTerrains.list, orcTerrains.list, goblinTerrains.list, unalignedTerrains.list];
        this.availableDwarfs = [];
        this.availableHumans = [];
        this.availableElfs = [];
        this.availableOrcs = [];
        this.availableGoblins = [];
        this.availableUndead = [];
        this.availableUnaligned = [];
        this.pureAvailableTroops = [];
        this.eitherTroops = [];
        this.armySelection = new ArmySelection(regionSelection, this);
    };
    init(): void {
        this.regionSelection.setTroopSelection(this);
    }

    private getAvailableTroops(): void {
        this.availableDwarfs = [];
        this.availableHumans = [];
        this.availableElfs = [];
        this.availableOrcs = [];
        this.availableGoblins = [];
        this.availableUndead = [];
        this.availableUnaligned = [];
        this.pureAvailableTroops = [];
        this.eitherTroops = [];
        const chosenTerrains: Array<SelectedTerrain> = this.regionSelection.getChosenTerrains();
        this.terrainLists.forEach(terrainList => terrainList.forEach((terrain) => {
            chosenTerrains.forEach((chosenTerrain: SelectedTerrain) => {
                if (terrain.name === chosenTerrain.terrain.name && terrain.troops) {
                    terrain.troops.forEach((troop: UnitSelection) => {
                        switch (terrain.race) {
                            case 'Dwarf':
                                this.addTroopToList(this.availableDwarfs, troop);
                                break;
                            case 'Human':
                                this.addTroopToList(this.availableHumans, troop);
                                break;
                            case 'Elf':
                                this.addTroopToList(this.availableElfs, troop);
                                break;
                            case 'Orc':
                                this.addTroopToList(this.availableOrcs, troop);
                                break;
                            case 'Goblin':
                                this.addTroopToList(this.availableGoblins, troop);
                                break;
                            case 'Undead':
                                this.addTroopToList(this.availableUndead, troop);
                                break;    
                            default:
                                this.addTroopToList(this.availableUnaligned, troop);
                                break;
                        }
                    });
                }
            });
        }));
    }

    public createTable(): void {
        this.getAvailableTroops();
        const races: Array<string> = ['dwarf', 'human', 'elf', 'orc', 'goblin', 'undead', 'unaligned'];
        const types: Array<string> = ['Hero', 'Spellcaster', 'Infantry', 'Ranged', 'Cavalry', 'Monster'];
        races.forEach(race => {
            types.forEach(type => {
                const cell: HTMLElement = document.getElementById(race + type); 
                cell.innerHTML = '';
            })
        });
        this.availableDwarfs.forEach(unit => this.createTroopButton(unit, 'dwarf'));
        this.availableHumans.forEach(unit => this.createTroopButton(unit, 'human'));
        this.availableElfs.forEach(unit => this.createTroopButton(unit, 'elf'));
        this.availableOrcs.forEach(unit => this.createTroopButton(unit, 'orc'));
        this.availableGoblins.forEach(unit => this.createTroopButton(unit, 'goblin'));
        this.availableUndead.forEach(unit => this.createTroopButton(unit, 'undead'));
        this.availableUnaligned.forEach(unit => this.createTroopButton(unit, 'unaligned'));
    }

    private createTroopButton(unit: Unit, race: string): void {
        const cellString: string = race + unit.type;
        const troopButton: HTMLButtonElement = document.createElement("button");
        troopButton.innerHTML = unit.name;
        troopButton.className = "btn btn-success btn-block";
        troopButton.onclick = () => {
            this.armySelection.addUnitSheet(unit);
            this.createTable();
        };
        document.getElementById(cellString).appendChild(troopButton);
    }

    private addTroopToList(list: Array<Unit>, unit: UnitSelection): void {
        if (unit.either) {
            this.eitherTroops.push(unit);
        } else {
            this.pureAvailableTroops.push(unit);
        }
        const troopArray: Array<Unit> = unit.either ? unit.either : [unit];
        troopArray.forEach((troop: Unit) => {
            if (list.every((listUnit: Unit) => listUnit.name !== troop.name) && this.isTroopRemaining(troop)) {
                list.push(troop);
            }
        });
    }

    private isTroopRemaining(troop: Unit): boolean {
        const allSelectedTroops: Array<SelectedUnit> = this.armySelection.getSelectedUnits();
        if (troop.name.includes('General')) {
            if(allSelectedTroops.find((selectedTroop: SelectedUnit) => selectedTroop.unit.name.includes('General'))) {
                return false;
            }
        }
        let troopCount: number = 0;
        let unitCount: number = 0;
        let availableUnitCount: number = 0;
        allSelectedTroops.forEach((selectedTroop: SelectedUnit) => {
            if (selectedTroop.unit.name === troop.name) {
                troopCount ++;
                unitCount += selectedTroop.quantity;
            }
        });
        this.pureAvailableTroops.some((availableTroop: Unit) => {
            if (availableTroop.name !== troop.name) {
                return false;
            }
            if (availableTroop.count) {
                availableUnitCount += availableTroop.count;
                return false;
            } else {
                availableUnitCount = -1;
                return true;
            }
        });
        if (availableUnitCount === 0 || availableUnitCount <= unitCount) {
            allSelectedTroops.some((selectedTroop: SelectedUnit) => {
                let availableCountForSelected: number = 0;
                let selectedTroopsTotalQuantity: number = 0;
                this.pureAvailableTroops.some((availableTroop: Unit) => {
                    if (availableTroop.name !== selectedTroop.unit.name) {
                        return false;
                    }
                    if (availableTroop.count) {
                        availableCountForSelected += availableTroop.count;
                        return false;
                    } else {
                        availableCountForSelected = -1;
                        return true;
                    }
                });
                allSelectedTroops.forEach((selected: SelectedUnit) => {
                    if (selected.unit.name === selectedTroop.unit.name) {
                        selectedTroopsTotalQuantity += selected.quantity;
                    }
                });
                if (availableCountForSelected >= selectedTroopsTotalQuantity) {
                    return false;
                }
                let selectedEither: UnitSelection;
                this.eitherTroops.forEach((eitherTroop: UnitSelection) => {
                    if (eitherTroop.either.find((singleEitherTroop: Unit) => singleEitherTroop.name === selectedTroop.unit.name)) {
                        if (!(selectedEither && selectedEither.either.length < eitherTroop.either.length)) {
                            selectedEither = eitherTroop;
                        }
                    } 
                });
                if (selectedEither) {
                    this.eitherTroops = this.eitherTroops.filter((eitherTroop: UnitSelection) => eitherTroop !== selectedEither);
                    const selectedEitherTroop: Unit = selectedEither.either.find((eitherTroop: Unit) => eitherTroop.name === selectedTroop.unit.name);
                    this.pureAvailableTroops.push(selectedEitherTroop);
                    if (troop.name === selectedEitherTroop.name) {
                        availableUnitCount += selectedEitherTroop.count;
                    }
                }          
            });
            this.eitherTroops.forEach((eitherTroop: UnitSelection) => eitherTroop.either.forEach((eitherUnit: Unit) => {
                if(eitherUnit.name === troop.name) {
                    availableUnitCount += eitherUnit.count
                }})
            );     
        };
        if (troopCount >= MAX_SAME_UNITS) {
            return false;
        }
        if (availableUnitCount === -1) {
            return true;
        } else if (availableUnitCount <= unitCount) {
            return false;
        }
        return true;
    };
}
export default TroopSelection;