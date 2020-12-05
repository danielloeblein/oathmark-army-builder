import RegionSelection from "./regionSelection";
import TroopSelection from "./troopSelection";
import Veterans from "./veterans";
import Compendium from "./compendium";
import MagicItems from "./magicAndAbilities/items.json";
import Spelllists from "./magicAndAbilities/spelllist.json";
import SpecialAbilities from "./magicAndAbilities/specialAbilities.json";
import HeroicTraits from "./magicAndAbilities/heroicTraits.json";
import Unit from "./models/unit";
import SelectedUnit from "./models/selectedUnit";
import Special from "./models/special";
import Item from "./models/item";
import HeroicTrait from "./models/heroicTrait";
import Spell from "./models/spell";
import Option from "./models/option";
import SummonedTroops from "./magicAndAbilities/summonedTroops.json";
import SelectedTerrain from "./models/selectedTerrain";
import VeteranUnit from "./models/veteranUnit";

const statTitles: Array<string>  = ['A', 'M', 'F', 'S', 'D', 'CD', 'H', 'Pts', 'Special', 'Base'];
const statVerbose: Array<string> = ['activation', 'movement', 'fight', 'shoot', 'defense', 'combatDice', 'health', 'points', 'special', 'base'];
const magicItemsId: string = "magicItemsContainer";
const spellTableId: string = "spellTable";
const heroicTraitsId: string = "heroicTraitsContainer";
const CACHED_ARMY: string = "cachedArmy";
class ArmySelection {
    private addedUnits: Array<SelectedUnit>;
    private unitId: number;
    private import: HTMLInputElement;
    private clear: HTMLButtonElement;
    private print: HTMLButtonElement;
    private regionSelection: RegionSelection;
    private troopSelection: TroopSelection;
    public veterans: Veterans;
    private compendium: Compendium;
    private totalPoints: number;
    private armyName: string
    private magicItems: Array<Item>;
    private veteranButtons: object;
    private unitSheets: Array<any>;
    private unitsNumber: number;

    constructor(regionSelection: RegionSelection, troopSelection: TroopSelection) {
        this.addedUnits = [];
        this.unitSheets = [];
        this.unitsNumber = 0;
        this.regionSelection = regionSelection;
        this.troopSelection = troopSelection;
        this.veterans = new Veterans(this.troopSelection, this);
        this.compendium = new Compendium(this.regionSelection, this);
        this.unitId = 0;
        this.totalPoints = 0;
        this.import = <HTMLInputElement> document.getElementById('importArmyButton');
        this.import.onclick = () => this.importArmy();
        this.clear = <HTMLButtonElement> document.getElementById('clearArmy');
        this.clear.onclick = () => this.clearArmy();
        this.print = <HTMLButtonElement> document.getElementById('printArmy');
        this.print.onclick = () => this.printArmy();
        this.magicItems = MagicItems.items;
        this.armyName = 'New Army';
        this.veteranButtons = {};
        const armyNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("armyName");
        armyNameInput.oninput = () => {
            this.armyName = armyNameInput.value ? armyNameInput.value : 'New Army';
            document.getElementById('armyNameBar').innerHTML = this.armyName;
            this.exportArmy();
        };
    }

    public init(): void {
        const cachedArmy = window.localStorage.getItem(CACHED_ARMY)
        if (cachedArmy) {
            this.loadArmy(JSON.parse(<string> cachedArmy));
        };
    }

    public addUnitSheet(unit: Unit, quantity: number, unitId: number, selectedOptions: Array<any>, battleHonors: number, name: string, spellList: Array<any>, xp: number): HTMLDivElement {
        document.getElementById("nonImportButtons").style.display = "block";
        const currentUnitId: number = unitId;
        this.addedUnits.push({unit: unit, quantity, unitId: currentUnitId, selectedOptions, battleHonors, name, spellList, xp});
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
            this.changeUnitNameInLink(changedUnit);
            this.addVeteranButton(resetButton, unit, currentUnitId, specialStatCell, notesCell_input, unitCost_input, tableDiv);
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
            this.changeUnitNameInLink(changedUnit);
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
        let specialStatCell: HTMLTableCellElement;
        statVerbose.forEach(stat => {
            const statCell: HTMLTableCellElement = document.createElement('td');
            statCell.id = stat + '_' + currentUnitId;
            if(stat === 'special') {
                let specialStatSpanArray: Array<HTMLAnchorElement> = [];
                unit.stats.special.forEach(specialStat => {
                    const specialSpan: HTMLAnchorElement = document.createElement('a');
                    if (specialStat.rank) {
                        specialSpan.innerHTML = specialStat.name + ' (' + specialStat.rank + ')';
                    } else {
                        specialSpan.innerHTML = specialStat.name;
                    }
                    this.addSpecialTooltip(specialStat, specialSpan);
                    specialStatSpanArray.push(specialSpan);
                });
                for (let i: number = 0; i < specialStatSpanArray.length; i++) {
                    statCell.appendChild(specialStatSpanArray[i]);
                    if (i + 1 !== specialStatSpanArray.length) {
                        const seperator = document.createElement('span');
                        seperator.innerHTML = ', ';
                        statCell.appendChild(seperator);
                    }
                }
                specialStatCell = statCell;
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
        resetButton.className = "btn white col-md-12 no-print";
        resetButton.innerHTML = "Remove Unit";
        resetButton.onclick = () => {
            tableDiv.parentElement.removeChild(tableDiv);
            this.removeSideBarLink(currentUnitId);
            this.unitSheets = this.unitSheets.filter((unitSheet) => unitSheet.unit?.unitId !== currentUnitId);
            this.addedUnits =this.addedUnits.filter(unit => unit.unitId !== currentUnitId);
            this.calculateTotalPoints();
            this.troopSelection.createTable();
            this.veterans.redrawVeterans();
            this.redrawUnits();
        }
        tableDiv.appendChild(tableSeperator);
        tableDiv.appendChild(resetButton);
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === currentUnitId);
        if (changedUnit.name) {
            this.addVeteranButton(resetButton, unit, currentUnitId, specialStatCell, notesCell_input, unitCost_input, tableDiv);
        }
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
    
        this.createSideBarLink(tableDiv, changedUnit);
        this.calculateTotalPoints();
        this.veterans.redrawVeterans();
        this.unitSheets.push({tableDiv: tableDiv, changedUnit: changedUnit});
        this.addSwitchButtons(tableDiv, changedUnit);
        return tableDiv;
    }

    addUnit(unit: Unit, quantity = 1, unitId = this.unitId, selectedOptions = [], battleHonors = 0, name = '', spellList = [], xp = 0): void {
        const currentUnitId: number = unitId;
        this.addedUnits.push({unit: unit, quantity, unitId: currentUnitId, selectedOptions, battleHonors, name, spellList, xp});
        this.unitId = currentUnitId + 1;
        this.redrawUnits();
    }

    private addVeteranButton(resetButton: HTMLButtonElement, unit: Unit, currentUnitId: number, specialStatCell: HTMLTableCellElement, notesCell_input: HTMLTableCellElement, unitCost_input: HTMLTableCellElement, tableDiv: HTMLDivElement) {
        if (this.veteranButtons[currentUnitId]) {
            try {
                tableDiv.removeChild(this.veteranButtons[currentUnitId]);
            } catch {

            }
        }
        const addToVeteransButton: HTMLButtonElement = document.createElement('button');
        resetButton.className = "btn white col-md-6 no-print";
        addToVeteransButton.className = "btn white col-md-6 no-print";
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === currentUnitId);
        if (this.veterans.veteransList.find((veteranUnit: VeteranUnit) => veteranUnit.unit.name === changedUnit.name)) {
            addToVeteransButton.innerHTML = "Update Veteran Unit";
        } else {
            addToVeteransButton.innerHTML = "Add to Veterans";
        }
        addToVeteransButton.onclick = () => {
            const changedUnitToAdd: SelectedUnit = this.addedUnits.find(unit => unit.unitId === currentUnitId);
            let specialString = '';
            specialStatCell.childNodes.forEach((node: Node) => {
                const nodeAsHTMLElement: HTMLElement = <HTMLElement>node;
                if (nodeAsHTMLElement.innerText.includes("Legendary Hero")) {
                    nodeAsHTMLElement.childNodes[0].childNodes.forEach((childNode: Node) => {
                        if (childNode.nodeName === "OUTPUT") {
                            specialString += `Legendary Hero (${childNode.textContent})`;
                        }
                    }
                    );
                } else {
                    specialString += nodeAsHTMLElement.innerText;
                }
            });
            let notesString = '';
            notesCell_input.childNodes.forEach((node: Node) => {
                const nodeAsHTMLElement: HTMLElement = <HTMLElement>node;
                notesString += nodeAsHTMLElement.innerText;
            });
            this.veterans.addVeteranUnit(changedUnitToAdd, unitCost_input.innerHTML, specialString, notesString);
            this.addVeteranButton(resetButton, unit, currentUnitId, specialStatCell, notesCell_input, unitCost_input, tableDiv);
        };
        this.veteranButtons[currentUnitId] = addToVeteransButton;
        tableDiv.insertBefore(addToVeteransButton, resetButton);
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
        document.getElementById('armyPointsBar').innerHTML = String(this.totalPoints);
        this.compendium.fillCompendium();
        this.exportArmy();
    }

    private getBattleHonor(unit: Unit, unitId: number): Option {
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === unitId);
        if (['infantry', 'ranged', 'cavalry'].includes(unit.type.toLowerCase()) 
        && !unit.stats.special.find((special: Special) => special.name === "Unthinking")
        && !unit.stats.special.find((special: Special) => special.name === "Spellcaster Control")
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

    private getHeroicTrait(unit: SelectedUnit): Array<HeroicTrait> {
        const availableTraits: Array<HeroicTrait> = [];
        if (unit.unit.stats.special.some((specialAbility: Special) => ['Champion', 'Command', 'Spellcaster'].includes(specialAbility.name)) 
        && !unit.unit.stats.special.some((specialAbility: Special) => ['Monster'].includes(specialAbility.name))) {
            HeroicTraits.traits.forEach((trait: HeroicTrait) => {
                if (!trait.only || unit.unit.stats.special.some((specialAbility: Special) => trait.only === specialAbility.name)) {
                    availableTraits.push(trait);
                }
            });
        };
        return availableTraits;
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
            let selectedOptionsAnchorArray: Array<HTMLAnchorElement> = [];
            let specialList: Array<Special> = Array.from(unit.stats.special);
            specialList.reverse();
            let specialStatSpanArray: Array<HTMLAnchorElement> = [];
            changedUnit.selectedOptions.forEach((selectedOption: Option) => {
                if (selectedOption.points) {
                    optionsCost += selectedOption.points;
                } else if (selectedOption.battleHonors) {
                    changedUnit.battleHonors = selectedOption.battleHonors;
                }
                if (selectedOption.battleHonors) {
                    specialStatSpanArray = specialStatSpanArray.filter(special => !special.innerHTML.includes(selectedOption.stats.special[0].name));
                    selectedOptionsAnchorArray = selectedOptionsAnchorArray.filter(selected => !selected.innerHTML.includes("Award Battle Honor"));
                }
                const selectedAnchor: HTMLAnchorElement = document.createElement('a');
                selectedAnchor.innerHTML = selectedOption.name;
                if(selectedOption.description) {
                    this.addItemTooltip(selectedOption, selectedAnchor);
                }
                selectedOptionsAnchorArray.push(selectedAnchor);               
                if (selectedOption.stats) {                
                    Object.keys(selectedOption.stats).forEach(stat => {
                        if (stat === 'special') {
                            selectedOption.stats.special.forEach(specialOption => {
                                const element: Special = specialList.find((special: Special) => special.name === specialOption.name);
                                const specialSpan: HTMLAnchorElement = document.createElement('a');
                                if (element) {
                                    specialList = specialList.filter((special: Special) => special.name !== specialOption.name);
                                    const rank: number = specialOption.rank === '+' ? <number> element.rank + 1 : <number> specialOption.rank;
                                    specialSpan.innerHTML = specialOption.name + ' (' + rank + ')';                                         
                                } else {
                                    if (specialOption.rank) {
                                        if (specialOption.rank === "xp") {
                                            const rangeForm: HTMLFormElement = document.createElement('form');
                                            const rangeInput: HTMLInputElement = document.createElement('input');
                                            rangeInput.setAttribute('type', 'number');
                                            rangeInput.min = '0';
                                            rangeInput.max  = '999999';
                                            rangeInput.value = String(changedUnit.xp);
                                            rangeInput.style.width = '5em';
                                            const rangeOutput: HTMLOutputElement = document.createElement('output');
                                            rangeOutput.value = String(changedUnit.xp);
                                            rangeOutput.className = 'only_print_inline';
                                            rangeInput.oninput = () => {
                                               changedUnit.xp = rangeInput.valueAsNumber;
                                               rangeOutput.value = rangeInput.value;
                                               this.exportArmy();
                                            };
                                            rangeInput.className = "no-print";
                                            const rangeLabel: HTMLLabelElement = document.createElement('label');
                                            rangeLabel.innerHTML = specialOption.name + ' (';
                                            const rangeEndLabel: HTMLLabelElement = document.createElement('label');
                                            rangeEndLabel.innerHTML = ')';
                                            rangeForm.style.display = "inline-block";
                                            rangeForm.appendChild(rangeLabel);
                                            rangeForm.appendChild(rangeInput);
                                            rangeForm.appendChild(rangeOutput);
                                            rangeForm.appendChild(rangeEndLabel);
                                            specialSpan.appendChild(rangeForm);
                                        } else {
                                            const rank: number = specialOption.rank === '+' ? 1 : <number> specialOption.rank;
                                            specialSpan.innerHTML = specialOption.name + ' (' + rank + ')';
                                        }
                                    } else {
                                        specialSpan.innerHTML = specialOption.name;
                                    }
                                }                           
                                this.addSpecialTooltip(specialOption, specialSpan);       
                                specialStatSpanArray.push(specialSpan);
                            });
                        } else {
                            const statField: HTMLElement = document.getElementById(stat + '_' + unitId);
                            statField.innerHTML = selectedOption.stats[stat];
                        }
                    });
                }
            });
            specialList.forEach((specialStat: Special) => {
                const specialSpan: HTMLAnchorElement = document.createElement('a');
                if (specialStat.rank) {
                    specialSpan.innerHTML = specialStat.name + ' (' + specialStat.rank + ')';
                } else {
                    specialSpan.innerHTML = specialStat.name;
                }
                this.addSpecialTooltip(specialStat, specialSpan);
                specialStatSpanArray.unshift(specialSpan);
            });
            const specialField: HTMLElement = document.getElementById('special' + '_' + unitId);
            specialField.innerHTML = '';
            for (let i: number = 0; i < specialStatSpanArray.length; i++) {
                specialField.appendChild(specialStatSpanArray[i]);
                if (i + 1 !== specialStatSpanArray.length) {
                    const seperator = document.createElement('span');
                    seperator.innerHTML = ', ';
                    specialField.appendChild(seperator);
                }
            }
            unitCost_input.innerHTML = String(this.calculateUnitCost(changedUnit.unit.stats.points, optionsCost, changedUnit.quantity, changedUnit.battleHonors));
            this.calculateTotalPoints();
            notesCell_input.innerHTML = "";
            for (let i: number = 0; i < selectedOptionsAnchorArray.length; i++) {
                notesCell_input.appendChild(selectedOptionsAnchorArray[i]);
                if (i + 1 < selectedOptionsAnchorArray.length) {
                    const seperationSpan: HTMLSpanElement = document.createElement('span');
                    seperationSpan.innerHTML = ', ';
                    notesCell_input.appendChild(seperationSpan);
                }
            }
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
                    optionButton.innerHTML = option.points ? `${option.name} (${option.points} Points)` : option.name;
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

            if (this.getHeroicTrait(changedUnit).length > 0) {
                const heroicTraitButton: HTMLButtonElement = document.createElement('button');
                heroicTraitButton.className = "btn lightGrey btn-block";
                heroicTraitButton.innerHTML = "Add heroic trait";
                heroicTraitButton.onclick = () => {
                    this.showHeroicTraits(changedUnit, this.getHeroicTrait(changedUnit), optionsCell_input, createSelected, populateOptionsField);
                }
                optionsCell_input.appendChild(heroicTraitButton);
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

    private calculateUnitCost(core: number|string, options: number, quantity: number, battleHonors: number): number {
        let cost: number = core === "NA" ? 0 : <number> core * quantity + options;
        for(let i: number = 0; i < battleHonors; i++) {
            cost = Math.ceil(parseFloat((cost * 1.1).toFixed(1)));
        }
        return cost;
    }

    public addSpecialTooltip(special: Special, field: HTMLElement) : void {
        if (!SpecialAbilities[special.name]) {
            return;
        }
        const overlay: HTMLSpanElement = document.createElement("span");
        overlay.style.visibility = "hidden";
        overlay.style.position = "absolute";
        overlay.style.zIndex = "1";
        overlay.className = "white no-print";
        overlay.style.padding = "1em";
        overlay.style.bottom = "125%";
        overlay.style.left = "0%";
        overlay.style.borderRadius = "1em";
        overlay.style.borderWidth = "0.2em";
        overlay.style.borderStyle = "groove";
        overlay.style.borderColor = "black";
        overlay.style.width = "20em";
        overlay.style.textAlign = "left";
        const overlayHeadline: string = special.rank ? `${special.name} (X)` : special.name;
        overlay.innerHTML = `<h5>${overlayHeadline} </h5>${SpecialAbilities[special.name]}`;
        field.onmouseover = () => {
            overlay.style.visibility = "visible";
        }
        field.onmouseout = () => {
            overlay.style.visibility = "hidden";
        }
        field.style.position = "relative";
        field.appendChild(overlay);
    }

    public exportArmy(): void {
        const exportObject = {
            "kingdomName": this.regionSelection.getKingdomName(),
            "kingName": this.regionSelection.getKingName(),
            "terrains": this.regionSelection.getChosenTerrains(),
            "armyName": this.armyName,
            "army": this.addedUnits,
            "veterans": this.veterans.veteransList
        }
        const exportText: Blob = new Blob([JSON.stringify(exportObject)], {type: 'application/json'});
        const url: string = window.URL.createObjectURL(exportText);
        const exportLink: HTMLAnchorElement = <HTMLAnchorElement>document.getElementById('exportArmy');
        exportLink.download = this.armyName + '.json';
        exportLink.href = url;
        window.localStorage.setItem(CACHED_ARMY, JSON.stringify(exportObject));
    }

    private importArmy(): void {
        const that: ArmySelection = this;
        const inputElement: HTMLInputElement = <HTMLInputElement>document.getElementById('importArmyInput');       
        const fileReader: FileReader = new FileReader(); 
        fileReader.onload = function() { 
            const exportedArmy = JSON.parse(<string>fileReader.result); 
            that.loadArmy(exportedArmy);
        };             
        fileReader.readAsText(inputElement.files[0]); 
    }

    private loadArmy(army: any): void {
        this.regionSelection.clearTerrains();
        const armyNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("armyName");
        this.addedUnits = army.army;
        this.redrawUnits();
        this.regionSelection.fillTerrains(army.terrains);
        armyNameInput.value = army.armyName;
        this.armyName = army.armyName;
        document.getElementById('armyNameBar').innerHTML = this.armyName;
        this.regionSelection.setKingdomName(army.kingdomName);
        this.regionSelection.setKingName(army.kingName);
        this.veterans.updateKingdomName(army.kingdomName);
        this.veterans.veteransList = army.veterans ? army.veterans : [];
        this.veterans.redrawVeterans();
    }

    private redrawUnits(): void {
        document.getElementById("unitSheets").innerHTML = '';
        const unitListSave: Array<SelectedUnit> = [];
        this.addedUnits.forEach((unit: SelectedUnit) => {
            unitListSave.push(unit);
        });
        this.addedUnits = [];
        this.clearSideBar();
        this.unitsNumber = unitListSave.length;
        unitListSave.forEach((unit: SelectedUnit) => {
            this.addUnitSheet(unit.unit, unit.quantity, unit.unitId, unit.selectedOptions, unit.battleHonors, unit.name, unit.spellList, unit.xp);
            this.calculateTotalPoints();
        })
        this.unitsNumber = 0;
        this.exportArmy();
    }

    public clearArmy(): void {
        this.addedUnits = [];
        this.unitId = 0;
        this.troopSelection.createTable();
        document.getElementById("unitSheets").innerHTML = '';
        this.calculateTotalPoints();
        this.clearSideBar();
        this.unitSheets = [];
        document.getElementById("nonImportButtons").style.display = "none";
        this.veterans.redrawVeterans();
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
        const oldTraitContainer: HTMLElement = document.getElementById(heroicTraitsId)
        if (oldTraitContainer) {
            oldTraitContainer.parentElement.removeChild(oldTraitContainer);
        }
        const magicItemsContainer: HTMLElement = document.createElement('div');
        magicItemsContainer.className = "no-print";
        magicItemsContainer.id = magicItemsId;
        this.magicItems.forEach(item => {
            if (!unit.selectedOptions.find((option: Option)=> option.name === item.name)) {
                const itemButton: HTMLButtonElement = document.createElement('button');
                itemButton.className = "btn invertedGrey rounded col-md-3";
                itemButton.innerHTML = `${item.name} (${item.points} Points)`;
                itemButton.onclick = () => {
                    unit.selectedOptions.push(item);            
                    selectedCB();  
                    populateCB();
                    magicItemsContainer.parentElement.removeChild(magicItemsContainer);
                };
                this.addItemTooltip(item, itemButton);
                magicItemsContainer.appendChild(itemButton);
            }
        });
        optionsContainer.parentElement.parentElement.parentElement.parentElement.appendChild(magicItemsContainer);
    }

    private addItemTooltip(item: Item|Option, button: HTMLButtonElement|HTMLAnchorElement) : void {
        if (!item.description) {
            return;
        }
        const overlay: HTMLSpanElement = document.createElement("span");
        overlay.style.visibility = "hidden";
        overlay.style.position = "absolute";
        overlay.style.zIndex = "1";
        overlay.className = "white no-print";
        overlay.style.padding = "1em";
        overlay.style.bottom = "125%";
        overlay.style.left = "0%";
        overlay.style.borderRadius = "1em";
        overlay.style.borderWidth = "0.2em";
        overlay.style.borderStyle = "groove";
        overlay.style.borderColor = "black";
        overlay.style.width = "20em";
        overlay.style.textAlign = "left";
        overlay.innerHTML = `<h5>${item.name} (${item.points} Points)</h5>${item.description}`;
        button.onmouseover = () => {
            overlay.style.visibility = "visible";
        }
        button.onmouseout = () => {
            overlay.style.visibility = "hidden";
        }
        button.style.position = "relative";
        button.appendChild(overlay);
    }

    private createSpelllist(spellRow: HTMLElement, unit: Unit, unitId: number): void {
        const changedUnit: SelectedUnit = this.addedUnits.find(unit => unit.unitId === unitId);
        const spellCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        let summonedUnitSheets: Array<HTMLDivElement> = [];
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
            summonedUnitSheets.forEach((summonedUnit: HTMLDivElement) => summonedUnit.parentElement.removeChild(summonedUnit));
            summonedUnitSheets = [];
            this.fillSpellListField(changedUnit, spellList_field, spellAdd_button);
            this.compendium.fillCompendium();
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
            const oldTraitContainer: HTMLElement = document.getElementById(heroicTraitsId)
            if (oldTraitContainer) {
                oldTraitContainer.parentElement.removeChild(oldTraitContainer);
            }
            const spellTable: HTMLTableElement = document.createElement("table");
            spellTable.id = spellTableId;
            unit.spelllist.forEach((spelllist: string) => {
                const spellListRow: HTMLTableRowElement = document.createElement("tr");
                const spellListHead: HTMLTableSectionElement = document.createElement("thead");
                spellListHead.innerHTML = `<h3>${spelllist} Spells</h3>`;
                const spellListField: HTMLTableCellElement = document.createElement("td");
                Spelllists[spelllist].forEach((spell: Spell) => {
                    if (!changedUnit.spellList.find((savedSpell: Spell) => savedSpell.name === spell.name)) {
                        const spellButton: HTMLButtonElement = document.createElement('button');
                        spellButton.innerHTML = spell.name + ' (CN' + spell.castingNumber + ')';
                        spellButton.className = "btn invertedGrey rounded col-md-3";
                        spellButton.onclick = () => {
                            changedUnit.spellList.push(spell);
                            const summonedUnitSheet = this.addSummonedUnit(spell);
                            if (summonedUnitSheet) {
                                summonedUnitSheets.push(summonedUnitSheet);
                            }
                            this.fillSpellListField(changedUnit, spellList_field, spellAdd_button);
                            spellTable.parentElement.removeChild(spellTable);
                        };
                        this.addSpellTooltip(spell, spellButton);
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

    private addSpellTooltip(spell: Spell, button: HTMLButtonElement|HTMLAnchorElement) : void {
        if (!spell.description) {
            return;
        }
        const overlay: HTMLSpanElement = document.createElement("span");
        overlay.style.visibility = "hidden";
        overlay.style.position = "absolute";
        overlay.style.zIndex = "1";
        overlay.className = "white no-print";
        overlay.style.padding = "1em";
        overlay.style.bottom = "125%";
        overlay.style.left = "0%";
        overlay.style.borderRadius = "1em";
        overlay.style.borderWidth = "0.2em";
        overlay.style.borderStyle = "groove";
        overlay.style.borderColor = "black";
        overlay.style.width = "20em";
        overlay.style.textAlign = "left";
        overlay.innerHTML = `<h5>${spell.name} (CN${spell.castingNumber})</h6>${spell.description}`;
        button.onmouseover = () => {
            overlay.style.visibility = "visible";
        }
        button.onmouseout = () => {
            overlay.style.visibility = "hidden";
        }
        button.style.position = "relative";
        button.appendChild(overlay);
        this.compendium.fillCompendium();
    }

    private fillSpellListField(changedUnit: SelectedUnit, spellList_field: HTMLElement, spellAdd_button: HTMLButtonElement): void {
        const spells: Array<HTMLAnchorElement> = changedUnit.spellList.map((spell: Spell) => {
            const spellAnchor: HTMLAnchorElement = document.createElement('a');
            spellAnchor.innerHTML = spell.name + ' (CN' + spell.castingNumber + ')';
            this.addSpellTooltip(spell, spellAnchor);
            return spellAnchor;
        });
        spellList_field.innerHTML = "";
        for (let i: number = 0; i < spells.length; i++) {
            spellList_field.appendChild(spells[i]);
            if (i + 1 < spells.length) {
                const seperationSpan: HTMLSpanElement = document.createElement('span');
                seperationSpan.innerHTML = ', ';
                spellList_field.appendChild(seperationSpan);
            }
        }
        let maxSpells: number = <number> changedUnit.unit.stats.special.find((special: Special )=> special.name === 'Spellcaster').rank;
        if (changedUnit.selectedOptions.find(option => option.name === 'Ring of Spellcasting')) {
            maxSpells++;
        }
        if (this.regionSelection.getChosenTerrains().find((terrain: SelectedTerrain) => terrain.terrain.name === 'Abandoned Temple Complex')) {
            maxSpells++;
        }
        if (changedUnit.spellList.length >= maxSpells) {
            spellAdd_button.style.display = 'none';
        } else {
            spellAdd_button.style.display = 'block';
        }
        this.exportArmy();
    }

    private showHeroicTraits(unit: SelectedUnit, heroicTraits: Array<HeroicTrait>, optionsContainer: HTMLElement, selectedCB: Function, populateCB: Function): void {
        const oldContainer: HTMLElement = document.getElementById(heroicTraitsId)
        if (oldContainer) {
            oldContainer.parentElement.removeChild(oldContainer);
        }
        const oldSpellTable: HTMLElement = document.getElementById(spellTableId);
        if (oldSpellTable) {
            oldSpellTable.parentElement.removeChild(oldSpellTable);
        }
        const oldItemContainer: HTMLElement = document.getElementById(magicItemsId)
        if (oldItemContainer) {
            oldItemContainer.parentElement.removeChild(oldItemContainer);
        } 
        const heroicTraitsContainer: HTMLElement = document.createElement('div');
        heroicTraitsContainer.className = "no-print";
        heroicTraitsContainer.id = heroicTraitsId;
        heroicTraits.forEach((trait: HeroicTrait) => {
            if (!unit.selectedOptions.find((option: Option)=> option.name === trait.name)) {
                const traitButton: HTMLButtonElement = document.createElement('button');
                traitButton.className = "btn invertedGrey rounded col-md-3";
                traitButton.innerHTML = `${trait.name} (${trait.points} Points)`;
                traitButton.onclick = () => {
                    const legendaryHero = unit.selectedOptions.some((selectedOption: Option) => selectedOption.stats?.special?.some((special: Special) => special.name === "Legendary Hero")) ? {} : 
                    {
                        "special": [
                            {
                                "name": "Legendary Hero",
                                "rank": "xp"
                            }
                        ]
                    } 
                    unit.selectedOptions.push({
                        "name": trait.name,
                        "description": trait.description,
                        "points": trait.points,
                        "stats": legendaryHero
                    });            
                    selectedCB();  
                    populateCB();
                    heroicTraitsContainer.parentElement.removeChild(heroicTraitsContainer);
                };
                this.addItemTooltip(trait, traitButton);
                heroicTraitsContainer.appendChild(traitButton);
            }
        });
        optionsContainer.parentElement.parentElement.parentElement.parentElement.appendChild(heroicTraitsContainer);
    }

    public getSelectedUnits() : Array<SelectedUnit> {
        return this.addedUnits;
    }

    private printArmy(): void {
        const kingdomDiv: HTMLElement = document.getElementById("terrainSelection");
        kingdomDiv.className = "container no-print";
        const compendiumDiv: HTMLElement = document.getElementById("compendiumContainer");
        compendiumDiv.className = "container no-print";
        const armyDiv: HTMLElement = document.getElementById("armyContainer");
        armyDiv.className = "container print";
        const veteransDiv: HTMLElement = document.getElementById("veteransContainer");
        veteransDiv.className = "container no-print";
        window.print();
    }

    private addSummonedUnit(spell: Spell): HTMLDivElement|void {
        if (SummonedTroops[spell.name]) {
            return this.addUnit(SummonedTroops[spell.name]);
        }
        return;
    }

    private createSideBarLink(tableDiv: HTMLDivElement, unit: SelectedUnit): void {
        tableDiv.id = `${unit.unitId}_link`;
        const sideBar: HTMLDivElement = <HTMLDivElement> document.getElementById('armyBar');
        const unitAnchor: HTMLAnchorElement = document.createElement('a');
        unitAnchor.innerHTML = unit.name ? unit.name : `${unit.unit.name}${unit.quantity > 1 ? ` (${unit.quantity})`: ''}`; 
        unitAnchor.href = `#${unit.unitId}_link`;
        unitAnchor.className = 'white rounded';
        unitAnchor.style.display = 'block';
        unitAnchor.style.textAlign = 'center';
        unitAnchor.style.textDecoration = 'none';
        unitAnchor.id = `${unit.unitId}_anchor`;
        sideBar.appendChild(unitAnchor);
    }

    private changeUnitNameInLink(unit: SelectedUnit): void {
        const unitAnchor: HTMLAnchorElement = <HTMLAnchorElement> document.getElementById(`${unit.unitId}_anchor`);
        unitAnchor.innerHTML = unit.name ? unit.name : `${unit.unit.name}${unit.quantity > 1 ? ` (${unit.quantity})`: ''}`; 
    }

    private removeSideBarLink(unitId: number): void {
        const unitAnchor: HTMLAnchorElement = <HTMLAnchorElement> document.getElementById(`${unitId}_anchor`);
        unitAnchor.parentElement.removeChild(unitAnchor);
    }

    private clearSideBar(): void {
        const sideBar: HTMLDivElement = <HTMLDivElement> document.getElementById('armyBar');
        const anchors: HTMLCollectionOf<HTMLAnchorElement> = sideBar.getElementsByTagName('a');
        Array.from(anchors).forEach((anchor: HTMLAnchorElement) => anchor.parentElement.removeChild(anchor));
    }

    private addSwitchButtons(tableDiv: HTMLDivElement, unit: SelectedUnit): void {
        const index: number = this.addedUnits.indexOf(unit);
        if(index > 0) {
            const switchUp: HTMLHeadElement = document.createElement('h2');
            switchUp.innerHTML = "&and;";
            switchUp.style.textAlign = "center";
            switchUp.style.cursor = "pointer";
            switchUp.style.marginBottom = "-0.1em";
            switchUp.style.borderRadius = "2em 2em 0 0";
            switchUp.className = "no-print lightGrey";
            switchUp.onclick = () => {
                const unitBefore = this.addedUnits[index - 1];
                this.addedUnits[index - 1] = unit;
                this.addedUnits[index] = unitBefore;
                this.redrawUnits();
            };
            tableDiv.insertBefore(switchUp, tableDiv.children[1]);
        }
        if(index < (this.unitsNumber ? (this.unitsNumber -1) : (this.addedUnits.length - 1))) {
            const switchDown: HTMLHeadElement = document.createElement('h2');
            switchDown.innerHTML = "&or;";
            switchDown.style.textAlign = "center";
            switchDown.style.cursor = "pointer";
            switchDown.style.marginTop = "-0.5em";
            switchDown.style.borderRadius = "0 0 2em 2em";
            switchDown.className = "no-print lightGrey";
            switchDown.onclick = () => {
                const unitAfter = this.addedUnits[index + 1];
                this.addedUnits[index + 1] = unit;
                this.addedUnits[index] = unitAfter;
                this.redrawUnits();
            };
            tableDiv.appendChild(switchDown);
        }
        
    }
}

export default ArmySelection;