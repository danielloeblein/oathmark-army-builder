import { utimes } from "fs";
import { threadId } from "worker_threads";
import ArmySelection from "./armySelection";
import SelectedTerrain from "./models/selectedTerrain";
import SelectedUnit from "./models/selectedUnit";
import VeteranUnit from "./models/veteranUnit";
import TroopSelection from "./troopSelection";

const statTitles: Array<string>  = ['A', 'M', 'F', 'S', 'D', 'CD', 'H', 'Pts', 'Special', 'Base'];
const statVerbose: Array<string> = ['activation', 'movement', 'fight', 'shoot', 'defense', 'combatDice', 'health', 'points', 'special', 'base'];
class Veterans {
    private armySelection: ArmySelection;
    private troopSelection: TroopSelection;
    private veteranSheets: HTMLDivElement;
    public veteransList: Array<VeteranUnit>;
    private print: HTMLButtonElement;
    private export: HTMLButtonElement;
    private import: HTMLButtonElement;
    private clear: HTMLButtonElement;
    private veteransNumber: number;
    
    constructor( troopSelection: TroopSelection, armySelection: ArmySelection) {
        this.armySelection = armySelection;
        this.troopSelection = troopSelection;
        this.veteranSheets = <HTMLDivElement> document.getElementById('veteranSheets');
        this.veteransList = [];
        this.veteransNumber = 0;
        this.import = <HTMLInputElement> document.getElementById('importVeteransButton');
        this.import.onclick = () => this.importVeterans();
        this.clear = <HTMLButtonElement> document.getElementById('clearVeterans');
        this.clear.onclick = () => this.clearVeterans();
        this.print = <HTMLButtonElement> document.getElementById('printVeterans');
        this.print.onclick = () => this.printVeterans();
    }

    addVeteranSheet(unit: SelectedUnit, points: string, special: string, notes: string): HTMLDivElement {
        document.getElementById("nonImportVeteransButtons").style.display = "block";
        if ( this.veteransList.find((veteranUnit: VeteranUnit) => veteranUnit.unit.name === unit.name)) {
            this.veteransList = this.veteransList.map((veteranUnit: VeteranUnit) => veteranUnit.unit.name === unit.name ? {unit, points, special, notes}: veteranUnit);
            this.redrawVeterans();
            return;
        }
        this.veteransList.push({unit, points, special, notes});
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
        nameCell_input.innerHTML = unit.name;
        const unitCost_title: HTMLTableHeaderCellElement = document.createElement('th');
        unitCost_title.innerHTML = 'Unit Cost';
        const unitCost_input: HTMLTableCellElement = document.createElement('td');
        unitCost_input.innerHTML = points;
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
        unitType_input.innerHTML = unit.unit.name;
        const unitQuantity_title: HTMLTableHeaderCellElement = document.createElement('th');
        unitQuantity_title.innerHTML = 'Quantity';
        const unitQuantity_input: HTMLTableCellElement = document.createElement('td');       
        unitQuantity_input.innerHTML = String(unit.quantity)
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
            if(stat === 'special') {
                statCell.innerHTML = special;
            } else {
                statCell.innerHTML = unit.unit.stats[stat];
            }
            statsInputRow.appendChild(statCell);
        })
        /* Equipment Row */
        const equipmentRow: HTMLTableRowElement = document.createElement('tr');
        const equipmentCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        equipmentCell_title.innerHTML = 'Equipment';
        equipmentCell_title.colSpan = 2;
        const equipmentCell_input: HTMLTableCellElement = document.createElement('td');
        equipmentCell_input.innerHTML = unit.unit.equipment.join(', ');
        equipmentCell_input.colSpan = 8;
        equipmentRow.appendChild(equipmentCell_title);
        equipmentRow.appendChild(equipmentCell_input);
        /* Notes Row */
        const notesRow: HTMLTableRowElement = document.createElement('tr');
        const notesCell_title: HTMLTableHeaderCellElement = document.createElement('th');
        notesCell_title.innerHTML = 'Notes';
        notesCell_title.colSpan = 2;
        const notesCell_input: HTMLTableCellElement = document.createElement('td');
        notesCell_input.innerHTML = notes;
        notesCell_input.colSpan = 8;
        notesRow.appendChild(notesCell_title);
        notesRow.appendChild(notesCell_input);
        /* Build Table */
        tableBody.appendChild(nameRow);
        tableBody.appendChild(descriptionRow);
        tableBody.appendChild(statsTitleRow); 
        tableBody.appendChild(statsInputRow); 
        tableBody.appendChild(equipmentRow); 
        tableBody.appendChild(notesRow); 
        table.appendChild(tableBody);
        table.style.paddingTop = "2cm";
        const tableSeperator: HTMLDivElement = document.createElement('div');
        tableSeperator.innerHTML = "&nbsp;";
        tableSeperator.className = "tableSeperator";
        const addToArmyButton: HTMLButtonElement = document.createElement('button');    
        addToArmyButton.innerHTML = "Add to Army";
        addToArmyButton.onclick = () => {
            this.armySelection.addUnit(unit.unit, unit.quantity, undefined, unit.selectedOptions, unit.battleHonors, unit.name, unit.spellList, unit.xp);
        }
        const resetButton: HTMLButtonElement = document.createElement('button');       
        resetButton.innerHTML = "Disband Unit";
        resetButton.onclick = () => {
            this.veteransList = this.veteransList.filter((veteran: VeteranUnit) => veteran.unit.name !== unit.name);
            tableDiv.parentElement.removeChild(tableDiv);
            this.removeSideBarLink(unit.name);
            this.redrawVeterans();
        }
        tableDiv.appendChild(tableSeperator);
        if (this.troopSelection.isTroopRemaining(unit.unit) && (!unit.name || !this.armySelection.getSelectedUnits().find((selectedUnit: SelectedUnit) => selectedUnit.name === unit.name))) {
            tableDiv.appendChild(addToArmyButton);
            addToArmyButton.className = "btn white col-md-6 no-print";
            resetButton.className = "btn white col-md-6 no-print";
        } else {
            resetButton.className = "btn white col-md-12 no-print";
        }
        tableDiv.appendChild(resetButton);
        tableDiv.appendChild(table);
        tableDiv.style.marginRight = "2.5cm";
        this.veteranSheets.appendChild(tableDiv);
        this.addSwitchButtons(tableDiv, unit);
        this.createSideBarLink(tableDiv, unit);
        this.exportVeterans();
        return tableDiv;
    }

    addVeteranUnit(unit: SelectedUnit, points: string, special: string, notes: string): void {
        if ( this.veteransList.find((veteranUnit: VeteranUnit) => veteranUnit.unit.name === unit.name)) {
            this.veteransList = this.veteransList.map((veteranUnit: VeteranUnit) => veteranUnit.unit.name === unit.name ? {unit, points, special, notes}: veteranUnit);
            this.redrawVeterans();
            return;
        }
        this.veteransList.push({unit, points, special, notes});
        this.redrawVeterans();
    }

    private importVeterans(): void {
        const that: Veterans = this;
        const inputElement: HTMLInputElement = <HTMLInputElement>document.getElementById('importVeteransInput');
        const fileReader: FileReader = new FileReader(); 
        fileReader.onload = function() { 
            const exportedVeterans = JSON.parse(<string>fileReader.result); 
            that.veteransList = exportedVeterans.veterans;
            that.redrawVeterans();
        };             
        fileReader.readAsText(inputElement.files[0]); 
    }

    private clearVeterans(): void {
        this.veteransList = [];
        this.redrawVeterans();
        this.clearSideBar();
        document.getElementById("nonImportVeteransButtons").style.display = "none";
    }

    private printVeterans(): void {
        const kingdomDiv: HTMLElement = document.getElementById("terrainSelection");
        kingdomDiv.className = "container no-print";
        const compendiumDiv: HTMLElement = document.getElementById("compendiumContainer");
        compendiumDiv.className = "container-fluid no-print";
        const armyDiv: HTMLElement = document.getElementById("armyContainer");
        armyDiv.className = "container no-print";
        const veteransDiv: HTMLElement = document.getElementById("veteransContainer");
        veteransDiv.className = "container print";
        window.print();
    }

    updateKingdomName(name: string): void {
        document.getElementById("veteransHeadline").innerHTML = `Veterans of the ${name}`;
        document.getElementById("veteranNameBar").innerHTML = `Veterans of the ${name}`;
    }

    redrawVeterans(): void {
        this.veteranSheets.innerHTML = "";
        const veteransListSave: Array<VeteranUnit> = [];
        this.veteransList.forEach((veteran: VeteranUnit) => {
            veteransListSave.push(veteran);
        });
        this.veteransList = [];
        this.clearSideBar();
        this.veteransNumber = veteransListSave.length;
        veteransListSave.forEach((veteran: VeteranUnit) => {
            this.addVeteranSheet(veteran.unit, veteran.points, veteran.special, veteran.notes);
        });
        this.veteransNumber = 0;
        this.exportVeterans();
    }

    public exportVeterans(): void {
        const exportObject = {veterans: this.veteransList};
        const exportText: Blob = new Blob([JSON.stringify(exportObject)], {type: 'application/json'});
        const url: string = window.URL.createObjectURL(exportText);
        const exportLink: HTMLAnchorElement = <HTMLAnchorElement>document.getElementById('exportVeterans');
        exportLink.download = document.getElementById("veteransHeadline").innerHTML + '.json';
        exportLink.href = url;
        this.armySelection.exportArmy();
    }

    private createSideBarLink(tableDiv: HTMLDivElement, unit: SelectedUnit): void {
        tableDiv.id = `${unit.name}_veteran_link`;
        const sideBar: HTMLDivElement = <HTMLDivElement> document.getElementById('veteranBar');
        const unitAnchor: HTMLAnchorElement = document.createElement('a');
        unitAnchor.innerHTML = unit.name; 
        unitAnchor.href = `#${unit.name}_veteran_link`;
        unitAnchor.className = 'white rounded';
        unitAnchor.style.display = 'block';
        unitAnchor.style.textAlign = 'center';
        unitAnchor.style.textDecoration = 'none';
        unitAnchor.id = `${unit.name}_veteran_anchor`;
        sideBar.appendChild(unitAnchor);
    }

    private removeSideBarLink(unitName: string): void {
        const unitAnchor: HTMLAnchorElement = <HTMLAnchorElement> document.getElementById(`${unitName}_veteran_anchor`);
        unitAnchor.parentElement.removeChild(unitAnchor);
    }

    private clearSideBar(): void {
        const sideBar: HTMLDivElement = <HTMLDivElement> document.getElementById('veteranBar');
        const anchors: HTMLCollectionOf<HTMLAnchorElement> = sideBar.getElementsByTagName('a');
        Array.from(anchors).forEach((anchor: HTMLAnchorElement) => anchor.parentElement.removeChild(anchor));
    }

    private addSwitchButtons(tableDiv: HTMLDivElement, unit: SelectedUnit): void {
        const veteranUnit: VeteranUnit = this.veteransList.find((veteranUnit: VeteranUnit) => veteranUnit.unit.name === unit.name);
        const index: number = this.veteransList.indexOf(veteranUnit);
        if(index > 0) {
            const switchUp: HTMLHeadElement = document.createElement('h2');
            switchUp.innerHTML = "&and;";
            switchUp.style.textAlign = "center";
            switchUp.style.cursor = "pointer";
            switchUp.style.marginBottom = "-0.1em";
            switchUp.style.borderRadius = "2em 2em 0 0";
            switchUp.className = "no-print lightGrey";
            switchUp.onclick = () => {
                const unitBefore = this.veteransList[index - 1];
                this.veteransList[index - 1] = veteranUnit;
                this.veteransList[index] = unitBefore;
                this.redrawVeterans();
            };
            tableDiv.insertBefore(switchUp, tableDiv.children[1]);
        }
        if(index < (this.veteransNumber ? (this.veteransNumber -1) : (this.veteransList.length - 1))) {
            const switchDown: HTMLHeadElement = document.createElement('h2');
            switchDown.innerHTML = "&or;";
            switchDown.style.textAlign = "center";
            switchDown.style.cursor = "pointer";
            switchDown.style.marginTop = "-0.5em";
            switchDown.style.borderRadius = "0 0 2em 2em";
            switchDown.className = "no-print lightGrey";
            switchDown.onclick = () => {
                const unitAfter = this.veteransList[index + 1];
                this.veteransList[index + 1] = veteranUnit;
                this.veteransList[index] = unitAfter;
                this.redrawVeterans();
            };
            tableDiv.appendChild(switchDown);
        }
    }
}

export default Veterans;