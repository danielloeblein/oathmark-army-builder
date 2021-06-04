import * as dwarfTerrains from "./terrains/dwarfTerrains.json";
import * as humanTerrains from "./terrains/humanTerrains.json";
import * as elfTerrains from "./terrains/elfTerrains.json";
import * as goblinAndOrcTerrains from "./terrains/goblinAndOrcTerrains.json";
import * as undeadTerrains from "./terrains/undeadTerrains.json";
import * as halflingTerrains from "./terrains/halflingTerrains.json";
import * as unalignedTerrains from "./terrains/unalignedTerrains.json";
import TroopSelection from "./troopSelection";
import Terrain from "./models/terrain";
import SelectedTerrain from "./models/selectedTerrain";
import ArmySelection from "./armySelection";
import UnitSelection from "./models/unitSelection";

class RegionSelection {
    private terrains_1: Array<Terrain>;
    private terrains_2: Array<Terrain>;
    private terrains_3: Array<Terrain>;
    private terrains_4: Array<Terrain>;
    private terrains_5: Array<Terrain>;
    private capital: Terrain;
    private chosenTerrains: Array<SelectedTerrain>;
    private terrainLists: Array<Array<Terrain>>;
    private troopSelection: TroopSelection;
    private clear: HTMLButtonElement;
    private kingdomName: string;
    private kingName: string;
    private import: HTMLInputElement;
    private print: HTMLButtonElement;
    private printAll: HTMLButtonElement;

    constructor() {
        this.terrains_1 =  [];
        this.terrains_2 =  [];
        this.terrains_3 =  [];
        this.terrains_4 =  [];
        this.terrains_5 =  [];
        this.chosenTerrains = [];
        this.terrainLists = [dwarfTerrains.list, humanTerrains.list, elfTerrains.list, goblinAndOrcTerrains.list, undeadTerrains.list, halflingTerrains.list, unalignedTerrains.list];
        this.clear = <HTMLButtonElement> document.getElementById("clearTerrains");
        this.clear.onclick = () => this.clearTerrains();
        this.kingdomName = 'NEW KINGDOM';
        this.kingName = 'NEW KING';
        this.import = <HTMLInputElement> document.getElementById('importKingdomButton');
        this.import.onclick = () => this.importKingdom();
        this.print = <HTMLButtonElement> document.getElementById('printKingdom');
        this.print.onclick = () => this.printKingdom();
        this.printAll= <HTMLButtonElement> document.getElementById('printAll');
        this.printAll.onclick = () => this.printEverything();
    };
    public init(): void { 
        this.terrainLists.forEach((terrainList: Array<Terrain>)=> terrainList.forEach((terrain: Terrain) => {
            if(terrain.region === 1 && !(terrain.name.toLowerCase().includes('city') || terrain.name.toLowerCase().includes('minor') || terrain.race === 'Unaligned')) {
                this.terrains_1.push(terrain);
            }
        }));
        const capitalField: HTMLElement = document.getElementById("capitalButtonField");
        const capitalButton: HTMLElement = document.getElementById('capitalButton');
        capitalField.onclick = () => {
            if (capitalField.innerHTML.trim() !== "Choose Capital") {
                return;
            }
            this.createCapitalSelectionButtons(this.terrains_1, capitalButton, capitalField)
        };
        capitalButton.onclick = () => {
            if (capitalField.innerHTML.trim() !== "Choose Capital") {
                return;
            }
            this.createCapitalSelectionButtons(this.terrains_1, capitalButton, capitalField)
        };
        for (let i:number = 2; i<= 5; i++) {
            for (let j:number = 1; j <= Math.min(i, 4); j++) {
                const terrainButton: HTMLElement = document.getElementById(`region_${i}_${j}`);
                const terrainField: HTMLElement = document.getElementById(`region_${i}_${j}_field`);
                terrainButton.onclick = () => {
                    if(terrainField.innerHTML.trim() !== "Choose Terrain") {
                        return;
                    }
                    const terrainsList = i === 2 ? this.terrains_2 : 
                                        i === 3 ? this.terrains_3 : 
                                        i === 4 ? this.terrains_4 : this.terrains_5;
                    this.createSelectionButtons(terrainsList, terrainButton, terrainField, `${i}_${j}`);
                }
                terrainField.onclick = () => {
                    if(terrainField.innerHTML.trim() !== "Choose Terrain") {
                        return;
                    }
                    const terrainsList = i === 2 ? this.terrains_2 : 
                                        i === 3 ? this.terrains_3 : 
                                        i === 4 ? this.terrains_4 : this.terrains_5;
                    this.createSelectionButtons(terrainsList, terrainButton, terrainField, `${i}_${j}`);
                }
            }
        }

        const kingdomNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("kingdomName");
        kingdomNameInput.oninput = () => {
            this.kingdomName = kingdomNameInput.value ? kingdomNameInput.value : 'NEW KINGDOM';
            this.troopSelection.armySelection.exportArmy();
            this.troopSelection.armySelection.veterans.updateKingdomName(this.kingdomName);
            this.exportKingdom();
        };

        const kingNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("kingName");
        kingNameInput.oninput = () => {
            this.kingName = kingNameInput.value ? kingNameInput.value : 'NEW KING';
            this.troopSelection.armySelection.exportArmy();
            this.exportKingdom();
        };
    }

    public getKingdomName(): string {
        return this.kingdomName;
    }

    public setKingdomName(kingdomName: string): void {
        this.kingdomName = kingdomName;
        const kingdomNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("kingdomName");
        kingdomNameInput.value = kingdomName;
    }

    public getKingName(): string {
        return this.kingName;
    }

    public setKingName(kingName: string): void {
        this.kingName = kingName;
        const kingNameInput: HTMLInputElement = <HTMLInputElement> document.getElementById("kingName");
        kingNameInput.value = kingName;
    }

    private createSelectionButtons(list: Array<Terrain>, button: HTMLElement, field: HTMLElement, region: string): void {
        const dwarfTerrainTable: HTMLElement = document.getElementById('dwarfTerrains');
        const humanTerrainTable: HTMLElement = document.getElementById('humanTerrains');
        const elfTerrainTable: HTMLElement = document.getElementById('elfTerrains');
        const goblinAndOrcTerrainTable: HTMLElement = document.getElementById('goblinAndOrcTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const halflingTerrainTable: HTMLElement = document.getElementById('halflingTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        goblinAndOrcTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        halflingTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        list.forEach((terrain: Terrain) => {
            if (terrain.unique && this.chosenTerrains.find(chosenTerrain => chosenTerrain.terrain.name === terrain.name)) {
                return;
            }
            const terrainTable: HTMLElement = terrain.race === 'Dwarf' ? dwarfTerrainTable : 
            terrain.race === 'Human' ? humanTerrainTable : 
            terrain.race === 'Elf' ? elfTerrainTable : 
            terrain.race === 'Goblin and Orc' ? goblinAndOrcTerrainTable :
            terrain.race === 'Undead' ? undeadTerrainTable : 
            terrain.race === 'Halfling' ? halflingTerrainTable : unalignedTerrainTable;
            const terrainButton: HTMLButtonElement = document.createElement('button');
            terrainButton.innerHTML = terrain.name;
            terrainButton.className = "btn lightGrey btn-block";
            terrainButton.onclick = () => {
                if (button) {
                    button.style.fill = "white";
                    button.style.cursor = "default";
                    field.style.fill = "black";
                    field.style.cursor = "default";
                    field.innerHTML = terrain.name;
                }
                dwarfTerrainTable.innerHTML = '';
                humanTerrainTable.innerHTML = '';
                elfTerrainTable.innerHTML = '';
                goblinAndOrcTerrainTable.innerHTML = '';
                undeadTerrainTable.innerHTML = '';
                halflingTerrainTable.innerHTML = '';
                unalignedTerrainTable.innerHTML = '';
                this.chosenTerrains.push({terrain: terrain, region: region});
                this.troopSelection.createTable();
                this.exportKingdom();
                window.location.href="#kingdomTerrains";
                this.troopSelection.armySelection.veterans.redrawVeterans();
            };
            terrainTable.appendChild(terrainButton);
            this.addTerrainTooltip(terrain, terrainButton);
        });
        window.location.href="#availableTerrains";
    }

    private createCapitalSelectionButtons(list: Array<Terrain>, button: HTMLElement = null, textField: HTMLElement, region: string = '1'): void {
        const dwarfTerrainTable: HTMLElement = document.getElementById('dwarfTerrains');
        const humanTerrainTable: HTMLElement = document.getElementById('humanTerrains');
        const elfTerrainTable: HTMLElement = document.getElementById('elfTerrains');
        const goblinAndOrcTerrainTable: HTMLElement = document.getElementById('goblinAndOrcTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const halflingTerrainTable: HTMLElement = document.getElementById('halflingTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        goblinAndOrcTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        halflingTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        list.forEach((terrain: Terrain) => {
            const terrainTable: HTMLElement = terrain.race === 'Dwarf' ? dwarfTerrainTable : 
            terrain.race === 'Human' ? humanTerrainTable : 
            terrain.race === 'Elf' ? elfTerrainTable : 
            terrain.race === 'Goblin and Orc' ? goblinAndOrcTerrainTable :
            terrain.race === 'Undead' ? undeadTerrainTable : 
            terrain.race === 'Halfling' ? halflingTerrainTable : unalignedTerrainTable;
            const terrainButton: HTMLButtonElement = document.createElement('button');
            terrainButton.innerHTML = terrain.name;
            terrainButton.className = "btn lightGrey btn-block";
            terrainButton.onclick = () => {
                if (button) {
                    button.style.fill = "white";
                    button.style.cursor = "default";
                    textField.style.fill = "black";
                    textField.style.cursor = "default";
                    let terrainName: string = terrain.name;
                    if (terrain.name.length > 15) {
                        terrainName = '';
                        terrain.name.split(' ').forEach((name: string, index: number) => {
                            const y = index === 0 ? -15 : 25;
                            terrainName += `<tspan x="350" dy="${y}">${name}</tspan>`;
                        });
                    }
                    textField.innerHTML = terrainName;
                }
                dwarfTerrainTable.innerHTML = '';
                humanTerrainTable.innerHTML = '';
                elfTerrainTable.innerHTML = '';
                goblinAndOrcTerrainTable.innerHTML = '';
                undeadTerrainTable.innerHTML = '';
                halflingTerrainTable.innerHTML = '';
                unalignedTerrainTable.innerHTML = '';
                this.capital = terrain;
                this.chosenTerrains.push({terrain: terrain, region: region});
                this.fillRegions();
                Array.from(document.getElementsByClassName('outerRing')).forEach((div: HTMLElement) => {
                    div.style.display = "block";
                });
                document.getElementById("nonImportKingdomButtons").style.display = "block";
                this.troopSelection.createTable();
                this.exportKingdom();
                window.location.href="#kingdomTerrains";
                this.troopSelection.armySelection.veterans.redrawVeterans();
            };
            terrainTable.appendChild(terrainButton);
            this.addTerrainTooltip(terrain, terrainButton);
        });
        window.location.href="#availableTerrains";
    }

    private addTerrainTooltip(terrain: Terrain, button: HTMLButtonElement) : void {
        if (!terrain.troops && !terrain.unique) {
            return;
        }
        const troopStringArray: Array<string> = [];
        terrain.troops?.forEach((troop: UnitSelection) => {
            if (troop.either) {
                const troopEitherStringArray: Array<string> = [];
                troop.either.forEach((singularTroop: UnitSelection) => {
                    troopEitherStringArray.push(singularTroop.count ? `${singularTroop.count} ${singularTroop.name}` : singularTroop.name);
                });
                troopStringArray.push(troopEitherStringArray.join(' or '));    
            } else {
                troopStringArray.push(troop.count ? `${troop.count} ${troop.name}` : troop.name);
            }
        })
        const overlay: HTMLSpanElement = document.createElement("span");
        overlay.style.visibility = "hidden";
        overlay.style.position = "absolute";
        overlay.style.zIndex = "1";
        overlay.className = "white no-print";
        overlay.style.width = "200%";
        overlay.style.padding = "5%";
        overlay.style.bottom = "125%";
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
        overlay.style.textAlign = "left";
        overlay.innerHTML = troopStringArray.length > 0 ? `<h4>Troops:</h4>${troopStringArray.join(';<br/>')}` : `<h4>Special:</h4>${terrain.unique}`;
        button.onmouseover = () => {
            overlay.style.visibility = "visible";
        }
        button.onmouseout = () => {
            overlay.style.visibility = "hidden";
        }
        button.style.position = "relative";
        button.appendChild(overlay);
    }

    private fillRegions(): void {
        const isSameRace: Function = (secondRace: string) => this.capital.race === secondRace || (['Orc', 'Goblin'].includes(this.capital.race) && ['Orc', 'Goblin'].includes(secondRace));
        this.terrainLists.forEach((terrainList: Array<Terrain>) => terrainList.forEach((terrain: Terrain) => {
            switch (terrain.region) {
                case 1:
                    if (terrain.name.toLowerCase().includes('city') || terrain.name.toLowerCase().includes('minor') || terrain.race === 'Unaligned') {
                        this.terrains_2.push(terrain);
                        this.terrains_3.push(terrain);
                        this.terrains_4.push(terrain);
                        this.terrains_5.push(terrain);
                    }
                    break;
                case 2:
                    if (isSameRace(terrain.race)) {
                        this.terrains_2.push(terrain);
                    }
                    this.terrains_3.push(terrain);
                    this.terrains_4.push(terrain);
                    this.terrains_5.push(terrain);
                    break;
                case 3:
                    if (isSameRace(terrain.race)) {
                        this.terrains_3.push(terrain);
                    }
                    this.terrains_4.push(terrain);
                    this.terrains_5.push(terrain); 
                    break;
                case 4:
                    if (isSameRace(terrain.race)) {
                        this.terrains_4.push(terrain);
                    }
                    this.terrains_5.push(terrain); 
                    break;   
                case 5:
                    if (isSameRace(terrain.race)) {
                        this.terrains_5.push(terrain);
                    }
                    break;
                default:
                    break;
            }
        }));
    }

    public getChosenTerrains(): Array<SelectedTerrain> {
        return this.chosenTerrains;
    }

    public setTroopSelection(troopSelection: TroopSelection): void {
        this.troopSelection = troopSelection;
    }

    public clearTerrains(): void {
        this.terrains_1 =  [];
        this.terrains_2 =  [];
        this.terrains_3 =  [];
        this.terrains_4 =  [];
        this.terrains_5 =  [];
        this.chosenTerrains = [];
        const dwarfTerrainTable: HTMLElement = document.getElementById('dwarfTerrains');
        const humanTerrainTable: HTMLElement = document.getElementById('humanTerrains');
        const elfTerrainTable: HTMLElement = document.getElementById('elfTerrains');
        const goblinAndOrcTerrainTable: HTMLElement = document.getElementById('goblinAndOrcTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const halflingTerrainTable: HTMLElement = document.getElementById('halflingTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        goblinAndOrcTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        halflingTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        for(let i: number = 2; i<=5; i++ ){
            for (let j: number = 1; j<=Math.min(i,4); j++) {
                const regionButton: HTMLElement = document.getElementById(`region_${i}_${j}`);
                const regionField: HTMLElement = document.getElementById(`region_${i}_${j}_field`);
                regionButton.style.fill = "url(#grad1)";
                regionField.style.fill = "wheat";
                regionField.innerHTML = "Choose Terrain";
            }
        }
        const regionArray: HTMLCollection = document.getElementsByClassName('outerRing');
        Array.from(regionArray).forEach((region: HTMLElement)  => {
            region.style.display = "none";
            region.style.cursor ="pointer";
        });
        const capitalButton: HTMLElement = document.getElementById('capitalButton');
        capitalButton.style.fill = "url(#grad1)";
        capitalButton.style.cursor = "pointer";
        const capitalField: HTMLElement = document.getElementById('capitalButtonField');
        capitalField.style.fill = "wheat";
        capitalField.style.cursor = "pointer";
        capitalField.innerHTML = "Choose Capital";
        document.getElementById("nonImportKingdomButtons").style.display = "none";
        this.init();
        this.troopSelection.createTable();
        this.troopSelection.armySelection.clearArmy();
        this.troopSelection.armySelection.veterans.redrawVeterans();
    }

    public fillTerrains(terrains: Array<SelectedTerrain>): void {
        this.chosenTerrains = terrains;
        terrains.forEach((terrain: SelectedTerrain) => {
            if(terrain.region === '1') {
                const button: HTMLElement = document.getElementById('capitalButton');
                button.style.fill = "white";
                button.style.cursor = "default";
                const field: HTMLElement = document.getElementById('capitalButtonField');
                field.style.fill = "black";
                field.style.cursor = "default";
                field.innerHTML = terrain.terrain.name;
                this.capital = terrain.terrain;
            } else {
                const button: HTMLElement = document.getElementById(`region_${terrain.region}`);
                button.style.fill = "white";
                button.style.cursor = "default";
                const field: HTMLElement = document.getElementById(`region_${terrain.region}_field`);
                field.style.fill = "black";
                field.style.cursor = "default";
                field.innerHTML = terrain.terrain.name;
            }
        });

        this.fillRegions();
        Array.from(document.getElementsByClassName('outerRing')).forEach((div: HTMLElement) => {
            div.style.display = "block";
        });
        this.exportKingdom();
        document.getElementById("nonImportKingdomButtons").style.display = "block";
        this.troopSelection.createTable();
        this.troopSelection.armySelection.veterans.redrawVeterans();
    }

    private exportKingdom(): void {
        const exportObject = {
            "kingdomName": this.getKingdomName(),
            "kingName": this.getKingName(),
            "terrains": this.getChosenTerrains()
        }
        const exportText: Blob = new Blob([JSON.stringify(exportObject)], {type: 'application/json'});
        const url: string = window.URL.createObjectURL(exportText);
        const exportLink: HTMLAnchorElement = <HTMLAnchorElement>document.getElementById('exportKingdom');
        exportLink.download = this.kingdomName + '.json';
        exportLink.href = url;
        this.troopSelection.armySelection.exportArmy();
    }

    private importKingdom(): void {
        this.clearTerrains();
        const that: RegionSelection = this;
        const inputElement: HTMLInputElement = <HTMLInputElement>document.getElementById('importKingdomInput');
        const fileReader: FileReader = new FileReader(); 
        fileReader.onload = function() { 
            const exportedKingdom = JSON.parse(<string>fileReader.result); 
            that.fillTerrains(exportedKingdom.terrains);
            that.setKingdomName(exportedKingdom.kingdomName);
            that.setKingName(exportedKingdom.kingName);
            that.troopSelection.armySelection.veterans.updateKingdomName(exportedKingdom.kingdomName);
        };             
        fileReader.readAsText(inputElement.files[0]); 
    }

    private printKingdom(): void {
        const kingdomDiv: HTMLElement = document.getElementById("terrainSelection");
        kingdomDiv.className = "container print";
        const compendiumDiv: HTMLElement = document.getElementById("compendiumContainer");
        compendiumDiv.className = "container-fluid no-print";
        const armyDiv: HTMLElement = document.getElementById("armyContainer");
        armyDiv.className = "container no-print";
        const veteransDiv: HTMLElement = document.getElementById("veteransContainer");
        veteransDiv.className = "container no-print";
        for(let i: number = 2; i<=5; i++ ){
            for (let j: number = 1; j<=Math.min(i,4); j++) {
                const regionField: HTMLElement = document.getElementById(`region_${i}_${j}_field`);
                if (regionField.innerHTML.trim() !== "Choose Terrain") {
                    regionField.setAttribute("class", "outerRing print");    
                } else {
                    regionField.setAttribute("class", "outerRing");    
                }
            }
        }
        window.print();
    }

    private printEverything(): void {
        const kingdomDiv: HTMLElement = document.getElementById("terrainSelection");
        kingdomDiv.className = "container print";
        const compendiumDiv: HTMLElement = document.getElementById("compendiumContainer");
        compendiumDiv.className = "container-fluid print";
        const armyDiv: HTMLElement = document.getElementById("armyContainer");
        armyDiv.className = "container print";
        const veteransDiv: HTMLElement = document.getElementById("veteransContainer");
        veteransDiv.className = "container print";
        for(let i: number = 2; i<=5; i++ ){
            for (let j: number = 1; j<=Math.min(i,4); j++) {
                const regionField: HTMLElement = document.getElementById(`region_${i}_${j}_field`);
                if (regionField.innerHTML.trim() !== "Choose Terrain") {
                    regionField.setAttribute("class", "outerRing print");    
                } else {
                    regionField.setAttribute("class", "outerRing");    
                }
            }
        }
        window.print();
    }
}
export default RegionSelection;