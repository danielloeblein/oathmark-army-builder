import * as dwarfTerrains from "./terrains/dwarfTerrains.json";
import * as humanTerrains from "./terrains/humanTerrains.json";
import * as elfTerrains from "./terrains/elfTerrains.json";
import * as goblinAndOrcTerrains from "./terrains/goblinAndOrcTerrains.json";
import * as undeadTerrains from "./terrains/undeadTerrains.json";
import * as halflingTerrains from "./terrains/halflingTerrains.json";
import * as unalignedTerrains from "./terrains/unalignedTerrains.json";
import ArmySelection from "./armySelection";
import RegionSelection from "./regionSelection";
import Terrain from "./models/terrain";
import SelectedTerrain from "./models/selectedTerrain";
import Unit from "./models/unit";
import UnitSelection from "./models/unitSelection";
import SelectedUnit from "./models/selectedUnit";
import Chariots from "./chariots";
import { unzip } from "zlib";

const MAX_SAME_UNITS: number = 4;

class TroopSelection {
    private regionSelection: RegionSelection;
    public armySelection: ArmySelection;
    private terrainLists: Array<Array<Terrain>>;
    private availableDwarfs: Array<Unit>;
    private availableHumans: Array<Unit>;
    private availableElfs: Array<Unit>;
    private availableGoblinsAndOrcs: Array<Unit>;
    private availableUndead: Array<Unit>;
    private availableHalflings: Array<Unit>;
    private availableUnaligned: Array<Unit>;
    private pureAvailableTroops: Array<Unit>;
    private eitherTroops: Array<UnitSelection>;
    private chariots: Chariots;

    constructor(regionSelection: RegionSelection) {
        this.regionSelection = regionSelection
        this.terrainLists = [dwarfTerrains.list, humanTerrains.list, elfTerrains.list, goblinAndOrcTerrains.list, undeadTerrains.list, unalignedTerrains.list, halflingTerrains.list];
        this.availableDwarfs = [];
        this.availableHumans = [];
        this.availableElfs = [];
        this.availableGoblinsAndOrcs = [];
        this.availableUndead = [];
        this.availableHalflings = [];
        this.availableUnaligned = [];
        this.pureAvailableTroops = [];
        this.eitherTroops = [];
        this.armySelection = new ArmySelection(regionSelection, this);
        this.chariots = new Chariots(this.armySelection, this.regionSelection, this);
    };
    init(): void {
        this.regionSelection.setTroopSelection(this);
        this.armySelection.init(this.chariots);
    }

    private getAvailableTroops(): void {
        this.availableDwarfs = [];
        this.availableHumans = [];
        this.availableElfs = [];
        this.availableGoblinsAndOrcs = [];
        this.availableUndead = [];
        this.availableHalflings = [];
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
                            case 'Goblin and Orc':
                                this.addTroopToList(this.availableGoblinsAndOrcs, troop);
                                break;
                            case 'Undead':
                                this.addTroopToList(this.availableUndead, troop);
                                break;    
                            case 'Halfling':
                                this.addTroopToList(this.availableHalflings, troop);
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
        const races: Array<string> = ['dwarf', 'human', 'elf', 'goblinAndOrc', 'undead', 'halfling', 'unaligned'];
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
        this.availableGoblinsAndOrcs.forEach(unit => this.createTroopButton(unit, 'goblinAndOrc'));
        this.availableUndead.forEach(unit => this.createTroopButton(unit, 'undead'));
        this.availableHalflings.forEach(unit => this.createTroopButton(unit, 'halfling'));
        this.availableUnaligned.forEach(unit => this.createTroopButton(unit, 'unaligned'));
    }

    private createTroopButton(unit: Unit, race: string): void {
        const cellString: string = race + unit.type;
        const troopButton: HTMLButtonElement = document.createElement("button");
        troopButton.innerHTML = unit.name;
        troopButton.className = "btn lightGrey btn-block";
        troopButton.onclick = () => {
            this.armySelection.addUnit(unit);
            this.createTable();
            if (unit.name.includes('Chariot')) {
                this.armySelection.redrawUnits();
            }
        };
        document.getElementById(cellString).appendChild(troopButton);
        this.addTroopTooltip(unit, troopButton);
    }

    private addTroopTooltip(unit: Unit, button: HTMLButtonElement) : void {
        const overlay: HTMLSpanElement = document.createElement("span");
        const troopTable: HTMLTableElement = document.createElement("table");
        const statTitles: Array<string>  = ['A', 'M', 'F', 'S', 'D', 'CD', 'H', 'Pts', 'Special', 'Base'];
        const statVerbose: Array<string> = ['activation', 'movement', 'fight', 'shoot', 'defense', 'combatDice', 'health', 'points', 'special', 'base'];
        const statsTitleRow: HTMLTableRowElement = document.createElement('tr');
        statTitles.forEach(title => {
            const titleCell: HTMLTableHeaderCellElement = document.createElement('th');
            titleCell.innerHTML = title;
            titleCell.style.width = title === 'Special' ? "30%" : "7%";
            statsTitleRow.appendChild(titleCell);
        });
        const statsInputRow: HTMLTableRowElement = document.createElement('tr');
        statVerbose.forEach(stat => {
            const statCell: HTMLTableCellElement = document.createElement('td');
            if(stat === 'special') {
                let specialStatStringArray: Array<string> = [];
                unit.stats.special.forEach(specialStat => {
                    if (specialStat.rank) {
                        specialStatStringArray.push(specialStat.name + ' (' + specialStat.rank + ')');
                    } else {
                        specialStatStringArray.push(specialStat.name);
                    }
                });
                statCell.innerHTML = specialStatStringArray.join(', ');
            } else {
                statCell.innerHTML = unit.stats[stat];
            }
            statsInputRow.appendChild(statCell);
        })
        troopTable.appendChild(statsTitleRow);
        troopTable.appendChild(statsInputRow);
        overlay.style.visibility = "hidden";
        overlay.style.position = "absolute";
        overlay.style.zIndex = "1";
        overlay.className = "white no-print";
        overlay.style.padding = "5%";
        overlay.style.bottom = "125%";
        overlay.style.width = "400%";
        const rect: DOMRect = button.getBoundingClientRect();
        if (rect.left > screen.width / 2) {
            overlay.style.right = "0%";
        } else {
            overlay.style.left = "0%";
        }      
        overlay.style.borderRadius = "1em";
        overlay.style.borderWidth = "0.2em";
        overlay.style.borderStyle = "groove";
        overlay.style.borderColor = "black";
        overlay.innerHTML = `<h5>${unit.name}</h5>`
        overlay.appendChild(troopTable);
        button.onmouseover = () => {
            overlay.style.visibility = "visible";
        }
        button.onmouseout = () => {
            overlay.style.visibility = "hidden";
        }
        button.style.position = "relative";
        button.appendChild(overlay);
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

    public isTroopRemaining(troop: Unit): boolean {
        if (troop.name.includes('Chariot') && !troop.name.includes('Revenant')) {
            return this.chariots.isChariotAvailable(troop);
        }
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