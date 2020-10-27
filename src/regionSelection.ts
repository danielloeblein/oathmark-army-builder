import * as dwarfTerrains from "./terrains/dwarfTerrains.json";
import * as humanTerrains from "./terrains/humanTerrains.json";
import * as elfTerrains from "./terrains/elfTerrains.json";
import * as orcTerrains from "./terrains/orcTerrains.json";
import * as goblinTerrains from "./terrains/goblinTerrains.json";
import * as unalignedTerrains from "./terrains/unalignedTerrains.json";
import TroopSelection from "./troopSelection";
import Terrain from "./models/terrain";
import SelectedTerrain from "./models/selectedTerrain";

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

    constructor() {
        this.terrains_1 =  [];
        this.terrains_2 =  [];
        this.terrains_3 =  [];
        this.terrains_4 =  [];
        this.terrains_5 =  [];
        this.chosenTerrains = [];
        this.terrainLists = [dwarfTerrains.list, humanTerrains.list, elfTerrains.list, orcTerrains.list, goblinTerrains.list, unalignedTerrains.list];
        this.clear = <HTMLButtonElement> document.getElementById("clearTerrains");
        this.clear.onclick = () => this.clearTerrains();
    };
    public init(): void { 
        this.terrainLists.forEach((terrainList: Array<Terrain>)=> terrainList.forEach((terrain: Terrain) => {
            if(terrain.region === 1 && terrain.name.toLowerCase().includes('capital')) {
                this.terrains_1.push(terrain);
            }
        }));
        
        document.getElementById('capitalButton').onclick = () => this.createCapitalSelectionButtons(this.terrains_1, document.getElementById('capitalButton'));
        Array.from(document.getElementsByClassName('region_2')).forEach((button: HTMLElement) => {
            button.onclick = () => this.createSelectionButtons(this.terrains_2, button, 2);
        });
        Array.from(document.getElementsByClassName('region_3')).forEach((button: HTMLElement) => {
            button.onclick = () => this.createSelectionButtons(this.terrains_3, button, 3);
        });
        Array.from(document.getElementsByClassName('region_4')).forEach((button: HTMLElement) => {
            button.onclick = () => this.createSelectionButtons(this.terrains_4, button, 4);
        });
        Array.from(document.getElementsByClassName('region_5')).forEach((button: HTMLElement) => {
            button.onclick = () => this.createSelectionButtons(this.terrains_5, button, 5);
        });

    }

    private createSelectionButtons(list: Array<Terrain>, button: HTMLElement, region: number): void {
        const dwarfTerrainTable: HTMLElement = document.getElementById('dwarfTerrains');
        const humanTerrainTable: HTMLElement = document.getElementById('humanTerrains');
        const elfTerrainTable: HTMLElement = document.getElementById('elfTerrains');
        const orcTerrainTable: HTMLElement = document.getElementById('orcTerrains');
        const goblinTerrainTable: HTMLElement = document.getElementById('goblinTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        orcTerrainTable.innerHTML = '';
        goblinTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        list.forEach((terrain: Terrain) => {
            if (terrain.unique && this.chosenTerrains.find(chosenTerrain => chosenTerrain.terrain.name === terrain.name)) {
                return;
            }
            const terrainTable: HTMLElement = terrain.race === 'Dwarf' ? dwarfTerrainTable : 
            terrain.race === 'Human' ? humanTerrainTable : 
            terrain.race === 'Elf' ? elfTerrainTable : 
            terrain.race === 'Orc' ? orcTerrainTable :
            terrain.race === 'Goblin' ? goblinTerrainTable :
            terrain.race === 'Undead' ? undeadTerrainTable : unalignedTerrainTable;
            const terrainButton: HTMLButtonElement = document.createElement('button');
            terrainButton.innerHTML = terrain.name;
            terrainButton.className = "btn lightGrey btn-block";
            terrainButton.onclick = () => {
                if (button) {
                    button.parentElement.innerHTML = terrain.name;
                }
                dwarfTerrainTable.innerHTML = '';
                humanTerrainTable.innerHTML = '';
                elfTerrainTable.innerHTML = '';
                orcTerrainTable.innerHTML = '';
                goblinTerrainTable.innerHTML = '';
                undeadTerrainTable.innerHTML = '';
                unalignedTerrainTable.innerHTML = '';
                this.chosenTerrains.push({terrain: terrain, region: region});
                this.troopSelection.createTable();
                window.location.href="#chosenTerrains";
            };
            terrainTable.appendChild(terrainButton);
        });
        window.location.href="#availableTerrains";
    }

    private createCapitalSelectionButtons(list: Array<Terrain>, button: HTMLElement = null, region: number = 1): void {
        const dwarfTerrainTable: HTMLElement = document.getElementById('dwarfTerrains');
        const humanTerrainTable: HTMLElement = document.getElementById('humanTerrains');
        const elfTerrainTable: HTMLElement = document.getElementById('elfTerrains');
        const orcTerrainTable: HTMLElement = document.getElementById('orcTerrains');
        const goblinTerrainTable: HTMLElement = document.getElementById('goblinTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        orcTerrainTable.innerHTML = '';
        goblinTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        list.forEach((terrain: Terrain) => {
            const terrainTable: HTMLElement = terrain.race === 'Dwarf' ? dwarfTerrainTable : 
            terrain.race === 'Human' ? humanTerrainTable : 
            terrain.race === 'Elf' ? elfTerrainTable : 
            terrain.race === 'Orc' ? orcTerrainTable :
            terrain.race === 'Goblin' ? goblinTerrainTable :
            terrain.race === 'Undead' ? undeadTerrainTable : unalignedTerrainTable;
            const terrainButton: HTMLButtonElement = document.createElement('button');
            terrainButton.innerHTML = terrain.name;
            terrainButton.className = "btn lightGrey btn-block";
            terrainButton.onclick = () => {
                if (button) {
                    button.parentElement.innerHTML = terrain.name;
                }
                dwarfTerrainTable.innerHTML = '';
                humanTerrainTable.innerHTML = '';
                elfTerrainTable.innerHTML = '';
                orcTerrainTable.innerHTML = '';
                goblinTerrainTable.innerHTML = '';
                undeadTerrainTable.innerHTML = '';
                unalignedTerrainTable.innerHTML = '';
                this.capital = terrain;
                this.chosenTerrains.push({terrain: terrain, region: region});
                this.fillRegions();
                Array.from(document.getElementsByClassName('outerRing')).forEach((div: HTMLElement) => {
                    div.style.display = "block";
                });
                this.troopSelection.createTable();
                window.location.href="#chosenTerrains";
            };
            terrainTable.appendChild(terrainButton);
        });
        window.location.href="#availableTerrains";
    }

    private fillRegions(): void {
        const isSameRace: Function = (secondRace: string) => this.capital.race === secondRace || (['Orc', 'Goblin'].includes(this.capital.race) && ['Orc', 'Goblin'].includes(secondRace));
        this.terrainLists.forEach((terrainList: Array<Terrain>) => terrainList.forEach((terrain: Terrain) => {
            switch (terrain.region) {
                case 1:
                    if (!terrain.name.toLowerCase().includes('capital')) {
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
        const orcTerrainTable: HTMLElement = document.getElementById('orcTerrains');
        const goblinTerrainTable: HTMLElement = document.getElementById('goblinTerrains');
        const undeadTerrainTable: HTMLElement = document.getElementById('undeadTerrains');
        const unalignedTerrainTable: HTMLElement = document.getElementById('unalignedTerrains');
        dwarfTerrainTable.innerHTML = '';
        humanTerrainTable.innerHTML = '';
        elfTerrainTable.innerHTML = '';
        orcTerrainTable.innerHTML = '';
        goblinTerrainTable.innerHTML = '';
        undeadTerrainTable.innerHTML = '';
        unalignedTerrainTable.innerHTML = '';
        for(let i: number = 1; i<=5; i++ ){
            const fieldArray: HTMLCollection = document.getElementsByClassName('region_' + i + '_field');
            Array.from(fieldArray).forEach((tableHead: HTMLTableHeaderCellElement) => {
                tableHead.innerHTML = '';
                const button: HTMLButtonElement = document.createElement('button');
                button.innerHTML = i === 1 ? 'Choose Capital' : 'Add Terrain';
                button.className = i === 1 ? 'btn lightGrey btn-block' : 'btn lightGrey btn-block region_' + i;
                button.type = 'button';
                if (i === 1) {
                    button.id = 'capitalButton';
                } 
                tableHead.appendChild(button);
            });
        }
        const tableArray: HTMLCollection = document.getElementsByClassName('outerRing');
        Array.from(tableArray).forEach((tableHead: HTMLTableHeaderCellElement)  => {
            const tableElement: HTMLElement = <HTMLElement> tableHead;
            tableElement.style.display = 'none';
        });
        this.init();
        this.troopSelection.createTable();
        this.troopSelection.armySelection.clearArmy();
    }

    public fillTerrains(terrains: Array<SelectedTerrain>): void {
        this.chosenTerrains = terrains;
        const secondRing: Array<Terrain> = [];
        const thirdRing: Array<Terrain> = [];
        const fourthRing: Array<Terrain> = [];
        const fifthRing: Array<Terrain> = [];
        const tableArray: HTMLCollection = document.getElementsByClassName('outerRing');
        Array.from(tableArray).forEach((tableHead: HTMLTableHeaderCellElement)  => {
            const tableElement: HTMLElement = <HTMLElement> tableHead;
            tableElement.style.display = 'block';
        });
        terrains.forEach(terrain => {
            switch (terrain.region) {
                case 1:
                    this.capital = terrain.terrain;
                    break;
                case 2:
                    secondRing.push(terrain.terrain);
                    break;
                case 3:
                    thirdRing.push(terrain.terrain);
                    break;
                case 4:
                    fourthRing.push(terrain.terrain);
                    break;
                case 5:
                    fifthRing.push(terrain.terrain);
                    break;
                default:
                    break;
            }
        });
        for (let i: number = 1; i<=5; i++ ) {
            const fieldArray: Array<Element> = Array.from(document.getElementsByClassName('region_' + i + '_field'));
            if (i === 1) {
                fieldArray[0].innerHTML = this.capital.name;
            }
            if (i === 2) {
                let j : number = 0;
                while (secondRing.length > 0) {
                    const nextTerrain: Terrain = secondRing.shift();
                    if (nextTerrain) {
                        fieldArray[j].innerHTML = nextTerrain.name;
                        j++
                    }
                }
            }
            if (i === 3) {
                let j : number = 0;
                while (thirdRing.length > 0) {
                    const nextTerrain: Terrain = thirdRing.shift();
                    if (nextTerrain) {
                        fieldArray[j].innerHTML = nextTerrain.name;
                        j++
                    }
                }
            }
            if (i === 4) {
                let j : number = 0;
                while (fourthRing.length > 0) {
                    const nextTerrain: Terrain = fourthRing.shift();
                    if (nextTerrain) {
                        fieldArray[j].innerHTML = nextTerrain.name;
                        j++
                    }
                }
            }
            if (i === 5) {
                let j : number = 0;
                while (fifthRing.length > 0) {
                    const nextTerrain: Terrain = fifthRing.shift();
                    if (nextTerrain) {
                        fieldArray[j].innerHTML = nextTerrain.name;
                        j++
                    }
                }
            }
        }
        this.fillRegions();
        this.troopSelection.createTable();
    }
}
export default RegionSelection;