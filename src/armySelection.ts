import RegionSelection from "./regionSelection";
import TroopSelection from "./troopSelection";
import MagicItems from "./magic/items.json";
import Spelllists from "./magic/spelllist.json";
import Unit from "./models/unit";
import SelectedUnit from "./models/selectedUnit";
import Special from "./models/special";
import Item from "./models/item";
import Spell from "./models/spell";
import Option from "./models/option";

const statTitles: Array<string>  = ['A', 'M', 'F', 'S', 'D', 'CD', 'H', 'Pts', 'Special', 'Base'];
const statVerbose: Array<string> = ['activation', 'movement', 'fight', 'shoot', 'defense', 'combatDice', 'health', 'points', 'special', 'base'];
const magicItemsId: string = "magicItemsContainer";
const spellTableId: string = "spellTable";
class ArmySelection {
    private addedUnits: Array<SelectedUnit>;
    private unitId: number;
    private import: HTMLInputElement;
    private clear: HTMLButtonElement;
    private regionSelection: RegionSelection;
    private troopSelection: TroopSelection;
    private totalPoints: number;
    private armyName: string
    private magicItems: Array<Item>;

    constructor(regionSelection: RegionSelection, troopSelection: TroopSelection) {
        this.addedUnits = [];
        this.regionSelection = regionSelection;
        this.troopSelection = troopSelection;
        this.unitId = 0;
        this.totalPoints = 0;
        this.import = <HTMLInputElement> document.getElementById('importArmyButton');
        this.import.onclick = () => this.importArmy();
        this.clear = <HTMLButtonElement> document.getElementById('clearArmy');
        this.clear.onclick = () => this.clearArmy();
        this.magicItems = MagicItems.items;
        this.armyName = 'New Army';
        const armyNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("armyName");
        armyNameInput.oninput = () => {
            this.armyName = armyNameInput.value ? armyNameInput.value : 'New Army';
            this.exportArmy();
        };
    }

    public addUnitSheet(unit: Unit, quantity = 1, unitId = this.unitId, selectedOptions = [], battleHonors = 0, name = '', spellList = []): void {
        document.getElementById("nonImportButtons").style.display = "block";
        const currentUnitId: number = unitId;
        this.addedUnits.push({unit: unit, quantity, unitId: currentUnitId, selectedOptions, battleHonors, name, spellList});
        this.unitId = currentUnitId + 1;
        const tableDiv: HTMLDivElement = document.createElement('div');
        tableDiv.style.pageBreakInside = 'avoid';
        const table: HTMLTableElement = document.createElement('table');
        table.className = 'table table-bordered';
        const tableBody: HTMLTableSectionElement = document.createElement('tbody');
        /* Name Row */
        const nameRow: HTMLTableRowElement = document.createElement('tr');
        const nameCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        nameCell_title.innerHTML = 'Unit Name';
        nameCell_title.colSpan = 2;
        const nameCell_input: HTMLTableCellElement = document.createElement('td');
        nameCell_input.colSpan = 6;
        const inputField: HTMLInputElement = document.createElement('input');
        inputField.value = name;
        inputField.oninput = () => {
            const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === currentUnitId);
            changedUnit.name = inputField.value;
            this.exportArmy();
        };
        inputField.className = "form-control";
        nameCell_input.appendChild(inputField);
        const unitCost_title: HTMLTableHeaderCellElement = document.createElement('th');
        unitCost_title.innerHTML = 'Unit Cost';
        const unitCost_input: HTMLTableCellElement = document.createElement('td');
        unitCost_input.innerHTML = String(this.calculateUnitCost(unit.stats.points, 0, quantity, battleHonors));
        nameRow.appendChild(nameCell_title);
        nameRow.appendChild(nameCell_input);
        nameRow.appendChild(unitCost_title);
        nameRow.appendChild(unitCost_input);
        /* Description Row */
        const descriptionRow: HTMLTableRowElement = document.createElement('tr');
        const unitType_title: HTMLTableHeaderCellElement = document.createElement('th');
        unitType_title.innerHTML = 'Unit Type';
        unitType_title.colSpan = 2;
        const unitType_input: HTMLTableCellElement = document.createElement('td');
        unitType_input.colSpan = 6;
        unitType_input.innerHTML = unit.name;
        const unitQuantity_title: HTMLTableHeaderCellElement = document.createElement('th');
        unitQuantity_title.innerHTML = 'Quantity';
        const unitQuantity_input: HTMLTableCellElement = document.createElement('td');       
        const rangeForm: HTMLFormElement = document.createElement('form');
        const rangeInput: HTMLInputElement = document.createElement('input');
        rangeInput.setAttribute('type', 'number');
        rangeInput.min = '1';
        rangeInput.max  = String(unit.stats.unitSize);
        rangeInput.value = String(quantity);
        rangeInput.oninput = () => {
            const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === currentUnitId);
            changedUnit.quantity = rangeInput.valueAsNumber;
            let optionsCost: number = 0;
            changedUnit.selectedOptions.forEach(selectedOption => {
                if(selectedOption.points) {
                    optionsCost += selectedOption.points
                }
            });
            unitCost_input.innerHTML = String(this.calculateUnitCost(changedUnit.unit.stats.points, optionsCost, changedUnit.quantity, changedUnit.battleHonors));
            this.calculateTotalPoints();
            this.troopSelection.createTable();
        };
        rangeInput.className = "no-print";
        const rangeOutput: HTMLOutputElement = document.createElement('output');
        rangeOutput.value = String(quantity);
        rangeOutput.className = 'only_print';
        rangeForm.oninput = () => rangeOutput.value = rangeInput.value;
        rangeForm.appendChild(rangeInput);
        rangeForm.appendChild(rangeOutput);
        unitQuantity_input.appendChild(rangeForm);
        descriptionRow.appendChild(unitType_title);
        descriptionRow.appendChild(unitType_input);
        descriptionRow.appendChild(unitQuantity_title);
        descriptionRow.appendChild(unitQuantity_input);
        /* Stats Row */
        const statsTitleRow: HTMLTableRowElement = document.createElement('tr');
        statTitles.forEach(title => {
            const titleCell: HTMLTableHeaderCellElement = document.createElement('th');
            titleCell.innerHTML = title;
            titleCell.style.width = title === 'Special' ? "37%" : "7%";
            statsTitleRow.appendChild(titleCell);
        });
        const statsInputRow: HTMLTableRowElement = document.createElement('tr');
        statVerbose.forEach(stat => {
            const statCell: HTMLTableCellElement = document.createElement('td');
            statCell.id = stat + '_' + currentUnitId;
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
        /* Equipment Row */
        const equipmentRow: HTMLTableRowElement = document.createElement('tr');
        const equipmentCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        equipmentCell_title.innerHTML = 'Equipment';
        equipmentCell_title.colSpan = 2;
        const equipmentCell_input: HTMLTableCellElement = document.createElement('td');
        equipmentCell_input.innerHTML = unit.equipment.join(', ');
        equipmentCell_input.colSpan = 8;
        equipmentRow.appendChild(equipmentCell_title);
        equipmentRow.appendChild(equipmentCell_input);
        /* Notes Row */
        const notesRow: HTMLTableRowElement = document.createElement('tr');
        const notesCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        notesCell_title.innerHTML = 'Notes';
        notesCell_title.colSpan = 2;
        const notesCell_input: HTMLTableCellElement = document.createElement('td');
        notesCell_input.colSpan = 8;
        notesRow.appendChild(notesCell_title);
        notesRow.appendChild(notesCell_input);
        /* Options Row */
        const optionsRow: HTMLTableRowElement = document.createElement('tr');
        const optionsCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        optionsCell_title.innerHTML = 'Options';
        optionsCell_title.colSpan = 2;
        optionsRow.appendChild(optionsCell_title);
        optionsRow.className = "no-print";
        /* Build Table */
        tableBody.appendChild(nameRow);
        tableBody.appendChild(descriptionRow);
        tableBody.appendChild(statsTitleRow); 
        tableBody.appendChild(statsInputRow); 
        tableBody.appendChild(equipmentRow); 
        tableBody.appendChild(notesRow); 
        tableBody.appendChild(optionsRow); 
        table.appendChild(tableBody);
        table.style.paddingTop = "2cm";
        const tableSeperator: HTMLDivElement = document.createElement('div');
        tableSeperator.innerHTML = "&nbsp;";
        tableSeperator.className = "tableSeperator";
        const resetButton: HTMLButtonElement = document.createElement('button');
        resetButton.className = "btn white btn-block no-print";
        resetButton.innerHTML = "Remove Unit";
        resetButton.onclick = () => {
            tableDiv.parentElement.removeChild(tableDiv);
            this.addedUnits =this.addedUnits.filter(unit => unit.unitId !== currentUnitId);
            this.calculateTotalPoints();
            this.troopSelection.createTable();
        }
        tableDiv.appendChild(tableSeperator);
        tableDiv.appendChild(resetButton);
        tableDiv.appendChild(table);
        tableDiv.style.marginRight = "2.5cm";
        document.getElementById('unitSheets').appendChild(tableDiv);
        const optionsInput: HTMLTableCellElement = this.createOptions(unit, currentUnitId, unitCost_input, notesCell_input);
        /* Spelllist */
        if (unit.spelllist) {
            const spellRow: HTMLTableRowElement = document.createElement('tr');
            this.createSpelllist(spellRow, unit, currentUnitId);
            tableBody.appendChild(spellRow);
        }
        optionsInput.colSpan = 8;
        optionsRow.appendChild(optionsInput);
    
        this.calculateTotalPoints();
    }

    private calculateTotalPoints(): void {
        this.totalPoints = 0;
        this.addedUnits.forEach(addedUnit => {
            let optionsCost: number = 0;
            addedUnit.selectedOptions.forEach((selectedOption: Option) => {
                if(selectedOption.points) {
                    optionsCost += selectedOption.points
                }
            });
            this.totalPoints += this.calculateUnitCost(addedUnit.unit.stats.points, optionsCost, addedUnit.quantity, addedUnit.battleHonors);
        });
        document.getElementById('currentPoints').innerHTML = String(this.totalPoints);
        this.exportArmy();
    }

    private getBattleHonor(unit: Unit, unitId: number): Option {
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === unitId);
        if (['infantry', 'ranged', 'cavalry'].includes(unit.type.toLowerCase()) 
        && ['25x25', '25x50'].includes(unit.stats.base)
        && !unit.name.toLowerCase().includes('slave')
        && !unit.name.toLowerCase().includes('militia')
        && !unit.name.toLowerCase().includes('engineer')) {
            let rank: number = changedUnit.battleHonors + 1;
            if (rank > 3) {
                return;
            }
            return {
                "name": 'Award Battle Honor (' + rank + ')',
                "battleHonors": rank,
                "stats": {
                    "special": [
                        {
                            "name": "Battle Honors",
                            "rank": rank
                        }
                    ]
                }
            }
        };
    }

    private createOptions(unit: Unit, unitId: number, unitCost_input: HTMLElement, notesCell_input: HTMLElement): HTMLTableCellElement {
        const optionsCell_input: HTMLTableCellElement = document.createElement('td');
        optionsCell_input.colSpan = 9;
        let optionsArray: Array<Option> = [];
        if (unit.options) {
            unit.options.forEach(option => optionsArray.push(option));
        }
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === unitId);
        const createSelected: Function = () => {
            let optionsCost: number = 0;
            let selectedOptionsStringArray: Array<string> = [];
            let specialList: Array<Special> = Array.from(unit.stats.special);
            specialList.reverse();
            let specialStatStringArray: Array<string> = [];
            changedUnit.selectedOptions.forEach((selectedOption: Option) => {
                if (selectedOption.points) {
                    optionsCost += selectedOption.points;
                } else if (selectedOption.battleHonors) {
                    changedUnit.battleHonors = selectedOption.battleHonors;
                }
                if (selectedOption.battleHonors) {
                    specialStatStringArray = specialStatStringArray.filter(special => !special.includes(selectedOption.stats.special[0].name));
                    selectedOptionsStringArray = selectedOptionsStringArray.filter(selected => !selected.includes("Award Battle Honor"));
                }
                selectedOptionsStringArray.push(selectedOption.name);               
                if (selectedOption.stats) {                
                    Object.keys(selectedOption.stats).forEach(stat => {
                        if (stat === 'special') {
                            selectedOption.stats.special.forEach(specialOption => {
                                const element: Special = specialList.find((special: Special) => special.name === specialOption.name);
                                if (element) {
                                    specialList = specialList.filter((special: Special) => special.name !== specialOption.name);
                                    const rank: number = specialOption.rank === '+' ? <number> element.rank + 1 : <number> specialOption.rank;
                                    specialStatStringArray.push(specialOption.name + ' (' + rank + ')');                                         
                                } else {
                                    if (specialOption.rank) {
                                        const rank: number = specialOption.rank === '+' ? 1 : <number> specialOption.rank;
                                        specialStatStringArray.push(specialOption.name + ' (' + rank + ')');
                                    } else {
                                        specialStatStringArray.push(specialOption.name);
                                    }
                                }                                  
                            });
                        } else {
                            const statField: HTMLElement = document.getElementById(stat + '_' + unitId);
                            statField.innerHTML = selectedOption.stats[stat];
                        }
                    });
                }
            });
            specialList.forEach((specialStat: Special) => {
                if (specialStat.rank) {
                    specialStatStringArray.unshift(specialStat.name + ' (' + specialStat.rank + ')');
                } else {
                    specialStatStringArray.unshift(specialStat.name);
                }
            });
            const specialField: HTMLElement = document.getElementById('special' + '_' + unitId);
            specialField.innerHTML = specialStatStringArray.join(', ');
            unitCost_input.innerHTML = String(this.calculateUnitCost(changedUnit.unit.stats.points, optionsCost, changedUnit.quantity, changedUnit.battleHonors));
            this.calculateTotalPoints();
            notesCell_input.innerHTML = selectedOptionsStringArray.join(', ');
        }
        const populateOptionsField: Function = () => {
            const currentBattleHonor: Option = this.getBattleHonor(unit, unitId);
            if (currentBattleHonor && changedUnit.battleHonors !== currentBattleHonor.battleHonors) {
                optionsArray.push(currentBattleHonor);
            }
            optionsCell_input.innerHTML = '';
            optionsArray.forEach(option => {
                if (changedUnit.selectedOptions.find(selectedOption => selectedOption.name === option.name)) {
                    createSelected();
                } else {
                    const optionButton: HTMLButtonElement = document.createElement('button');
                    optionButton.className = "btn lightGrey btn-block";
                    optionButton.innerHTML = option.name;
                    optionButton.onclick = () => {
                        changedUnit.selectedOptions.push(option);            
                        createSelected();  
                        optionButton.parentElement.removeChild(optionButton);
                        populateOptionsField();
                    }
                    optionsCell_input.appendChild(optionButton);
                }
            });
            if (changedUnit.unit.stats.special.find((item: Special)=> item.name.includes("Magic Items"))) {
                const magicItemButton: HTMLButtonElement = document.createElement('button');
                magicItemButton.className = "btn lightGrey btn-block";
                magicItemButton.innerHTML = "Add magic item";
                magicItemButton.onclick = () => {
                    this.showMagicItems(changedUnit, optionsCell_input, createSelected, populateOptionsField);
                }
                optionsCell_input.appendChild(magicItemButton);
            }
            
            if (changedUnit.selectedOptions.length > 0) {
                const resetOptionsButton: HTMLButtonElement = document.createElement('button');
                resetOptionsButton.className = "btn lightGrey btn-block";
                resetOptionsButton.innerHTML = "Reset Options";
                resetOptionsButton.onclick = () => {
                    changedUnit.selectedOptions = [];
                    changedUnit.battleHonors = 0;
                    optionsArray = optionsArray.filter(option => !option.battleHonors);
                    createSelected();
                    populateOptionsField();
                    statVerbose.forEach(stat => {
                        if (stat !== 'special') {
                            const statField: HTMLElement = document.getElementById(stat + '_' + unitId);
                            statField.innerHTML = changedUnit.unit.stats[stat];
                        }
                    });
                }
                optionsCell_input.appendChild(resetOptionsButton);
            }
        };
        createSelected();
        populateOptionsField();
        return optionsCell_input;
    }

    private calculateUnitCost(core: number, options: number, quantity: number, battleHonors: number): number {
        let cost: number = core * quantity + options;
        for(let i: number = 0; i < battleHonors; i++) {
            cost = Math.ceil(parseFloat((cost * 1.1).toFixed(1)));
        }
        return cost;
    }

    private exportArmy(): void {
        const exportObject = {
            "terrains": this.regionSelection.getChosenTerrains(),
            "armyName": this.armyName,
            "army": this.addedUnits
        }
        const exportText: Blob = new Blob([JSON.stringify(exportObject)], {type: 'application/json'});
        const url: string = window.URL.createObjectURL(exportText);
        const exportLink: HTMLAnchorElement = <HTMLAnchorElement>document.getElementById('exportArmy');
        exportLink.download = this.armyName + '.json';
        exportLink.href = url;
    }

    private importArmy(): void {
        this.regionSelection.clearTerrains();
        const that: ArmySelection = this;
        const inputElement: HTMLInputElement = <HTMLInputElement>document.getElementById('importArmyInput');
        const armyNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("armyName");
        const fileReader: FileReader = new FileReader(); 
        fileReader.onload = function() { 
            const exportedArmy = JSON.parse(<string>fileReader.result); 
            exportedArmy.army.forEach((unit: SelectedUnit) => {
                that.addUnitSheet(unit.unit, unit.quantity, unit.unitId, unit.selectedOptions, unit.battleHonors, unit.name, unit.spellList);
                that.calculateTotalPoints();
            }); 
            that.regionSelection.fillTerrains(exportedArmy.terrains);
            armyNameInput.value = exportedArmy.armyName;
            that.armyName = exportedArmy.armyName;
        };             
        fileReader.readAsText(inputElement.files[0]); 
    }

    public clearArmy(): void {
        this.addedUnits = [];
        this.unitId = 0;
        this.troopSelection.createTable();
        document.getElementById("unitSheets").innerHTML = '';
        this.calculateTotalPoints();
        document.getElementById("nonImportButtons").style.display = "none";
    }

    private showMagicItems(unit: SelectedUnit, optionsContainer: HTMLElement, selectedCB: Function, populateCB: Function): void {
        const oldContainer: HTMLElement = document.getElementById(magicItemsId)
        if (oldContainer) {
            oldContainer.parentElement.removeChild(oldContainer);
        }
        const oldSpellTable: HTMLElement = document.getElementById(spellTableId);
        if (oldSpellTable) {
            oldSpellTable.parentElement.removeChild(oldSpellTable);
        }
        const magicItemsContainer: HTMLElement = document.createElement('div');
        magicItemsContainer.className = "no-print";
        magicItemsContainer.id = magicItemsId;
        this.magicItems.forEach(item => {
            if (!unit.selectedOptions.find((option: Option)=> option.name === item.name)) {
                const itemButton: HTMLButtonElement = document.createElement('button');
                itemButton.className = "btn invertedGrey rounded col-md-3";
                itemButton.innerHTML = item.name;
                itemButton.onclick = () => {
                    unit.selectedOptions.push(item);            
                    selectedCB();  
                    populateCB();
                    magicItemsContainer.parentElement.removeChild(magicItemsContainer);
                };
                magicItemsContainer.appendChild(itemButton);
            }
        });
        optionsContainer.parentElement.parentElement.parentElement.parentElement.appendChild(magicItemsContainer);
    }

    private createSpelllist(spellRow: HTMLElement, unit: Unit, unitId: number): void {
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === unitId);
        const spellCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        spellCell_title.innerHTML = 'Spells';
        spellCell_title.colSpan = 2;
        const spellAdd_button: HTMLButtonElement = document.createElement('button');
        spellAdd_button.innerHTML = 'Add';
        spellAdd_button.className = "btn lightGrey btn-block no-print";
        spellCell_title.appendChild(spellAdd_button);

        const spellClear_button: HTMLButtonElement = document.createElement('button');
        spellClear_button.innerHTML = 'Clear';
        spellClear_button.className = "btn lightGrey btn-block no-print";
        spellCell_title.appendChild(spellClear_button);
        const spellList_field: HTMLTableCellElement = document.createElement('td');
        spellList_field.colSpan = 8;
        spellRow.appendChild(spellCell_title);
        spellRow.appendChild(spellList_field);
        
        spellClear_button.onclick = () => {
            changedUnit.spellList = [];
            const oldSpellTable: HTMLElement = document.getElementById(spellTableId);
            if (oldSpellTable) {
                oldSpellTable.parentElement.removeChild(oldSpellTable);
            }
            this.fillSpellListField(changedUnit, spellList_field, spellAdd_button);
        };
        spellAdd_button.onclick = () => {
            const oldSpellTable: HTMLElement = document.getElementById(spellTableId);
            if (oldSpellTable) {
                oldSpellTable.parentElement.removeChild(oldSpellTable);
            } 
            const oldContainer: HTMLElement = document.getElementById(magicItemsId)
            if (oldContainer) {
                oldContainer.parentElement.removeChild(oldContainer);
            }           
            const spellTable: HTMLTableElement = document.createElement("table");
            spellTable.id = spellTableId;
            unit.spelllist.forEach((spelllist: string) => {
                const spellListRow: HTMLTableRowElement = document.createElement("tr");
                const spellListHead: HTMLTableSectionElement = document.createElement("thead");
                spellListHead.innerHTML = spelllist + ' Spells';
                const spellListField: HTMLTableCellElement = document.createElement("td");
                Spelllists[spelllist].forEach((spell: Spell) => {
                    if (!changedUnit.spellList.find((savedSpell: Spell) => savedSpell.name === spell.name)) {
                        const spellButton: HTMLButtonElement = document.createElement('button');
                        spellButton.innerHTML = spell.name + ' (' + spell.castingNumber + ')';
                        spellButton.className = "btn invertedGrey rounded col-md-3";
                        spellButton.onclick = () => {
                            changedUnit.spellList.push(spell);
                            this.fillSpellListField(changedUnit, spellList_field, spellAdd_button);
                            spellTable.parentElement.removeChild(spellTable);
                        };
                        spellListField.appendChild(spellButton);
                    }
                })
                spellListRow.appendChild(spellListHead);
                spellListRow.appendChild(spellListField);
                spellTable.appendChild(spellListRow);
            });
            spellRow.parentElement.parentElement.parentElement.appendChild(spellTable);
        };
        this.fillSpellListField(changedUnit, spellList_field, spellAdd_button);
    }

    private fillSpellListField(changedUnit: SelectedUnit, spellList_field: HTMLElement, spellAdd_button: HTMLButtonElement): void {
        const spells: Array<string> = changedUnit.spellList.map((spell: Spell) => spell.name + ' (' + spell.castingNumber + ')');
        spellList_field.innerHTML = spells.join(', '); 
        let maxSpells: number = <number> changedUnit.unit.stats.special.find((special: Special )=> special.name === 'Spellcaster').rank;
        if (changedUnit.selectedOptions.find(option => option.name === 'Ring of Spellcasting')) {
            maxSpells++;
        }
        if (changedUnit.spellList.length >= maxSpells) {
            spellAdd_button.style.display = 'none';
        } else {
            spellAdd_button.style.display = 'block';
        }
        this.exportArmy();
    }

    public getSelectedUnits() : Array<SelectedUnit> {
        return this.addedUnits;
    }
}

export default ArmySelection;