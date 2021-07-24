import ArmySelection from "./armySelection";
import RegionSelection from "./regionSelection";

import HeroicTraits from "./magicAndAbilities/heroicTraits.json";
import MagicalItems from "./magicAndAbilities/items.json";
import Abilities from "./magicAndAbilities/specialAbilities.json";
import Spells from "./magicAndAbilities/spelllist.json";
import SupportTerrains from "./terrains/supportTerrains.json";
import ExpeditionTerrains from "./terrains/expeditionTerrains.json";
import FormationTerrains from "./terrains/formationTerrains.json";
import Special from "./models/special";
import SelectedUnit from "./models/selectedUnit";
import SelectedTerrain from "./models/selectedTerrain";
import Option from "./models/option";
import Spell from "./models/spell";
import Item from "./models/item";
import HeroicTrait from "./models/heroicTrait";
import Terrain from "./models/terrain";

const abilityBackground = "url('./sources/ability.png')";
const heroicBackground = "url('./sources/heroic.png')";
const itemBackground = "url('./sources/item.png')";
const dwarfBackground = "url('./sources/dwarfSpell.png')";
const elfBackground = "url('./sources/elfSpell.png')";
const generalBackground = "url('./sources/generalSpell.png')";
const humanBackground = "url('./sources/humanSpell.png')";
const orcBackground = "url('./sources/orcSpell.png')";
const undeadBackground = "url('./sources/undeadSpell.png')";
const halflingBackground = "url('./sources/halflingSpell.png')";

class Compendium {
    private regionSelection: RegionSelection;
    private armySelection: ArmySelection;
    private print: HTMLButtonElement;
    private compendiumContainer: HTMLDivElement;
    private compendiumNav: HTMLAnchorElement;
    private isCompendiumContainerFilled: boolean;
    private availableTerrains: Array<Terrain>;

    constructor(regionSelection: RegionSelection, armySelection: ArmySelection) {
        this.regionSelection = regionSelection;
        this.armySelection = armySelection;
        this.print = <HTMLButtonElement> document.getElementById('printCompendium');
        this.print.onclick = () => this.printCompendium();
        this.compendiumContainer = <HTMLDivElement> document.getElementById('compendiumContainer');
        this.compendiumNav = <HTMLAnchorElement> document.getElementById('compendiumNav');
        this.isCompendiumContainerFilled = false;
        this.availableTerrains = SupportTerrains.list.concat(ExpeditionTerrains.list).concat(FormationTerrains.list);
    }

    fillCompendium(): void {
        this.isCompendiumContainerFilled = false;
        this.fillAbilities();
        this.fillSpells();
        this.fillItems();
        this.fillTraits();
        this.fillUniqueTerrains();
        this.compendiumContainer.style.display = 'none';//this.isCompendiumContainerFilled ? 'block' : 'none';
        this.compendiumNav.style.display = 'none';//this.isCompendiumContainerFilled ? 'block' : 'none'; 
    }

    private fillAbilities(): void {
        const usedAbilities: Array<Special> = []
        const abilitiesDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('abilities');
        abilitiesDiv.innerHTML = "";
        Object.keys(Abilities).forEach((key: string) => {
            this.armySelection.getSelectedUnits().forEach((unit: SelectedUnit) => {
                unit.unit.stats?.special?.forEach((special: Special) => {
                    if (special.name === key && !usedAbilities.find((usedAbility: Special) => usedAbility.name === special.name)) {
                        usedAbilities.push(special);
                    }
                })
                unit.selectedOptions.forEach((option: Option) => {
                    option.stats?.special?.forEach((special: Special) => {
                        if (special.name === key && !usedAbilities.find((usedAbility: Special) => usedAbility.name === special.name)) {
                            usedAbilities.push(special);
                        }
                    })
                })
            })
        })
        if (usedAbilities.length > 0) {
            this.isCompendiumContainerFilled = true;
            const headline: HTMLHeadingElement = document.createElement('h3');
            headline.className = "text-center";
            headline.innerHTML = "ABILITIES";
            abilitiesDiv.appendChild(this.getSeperator());
            abilitiesDiv.appendChild(headline);
            usedAbilities.sort((a: Special, b: Special) => a.name < b.name ? 0 : 1).forEach((ability: Special) => {
                const abilityDiv: HTMLDivElement =  document.createElement('div');
                abilityDiv.className = "compendiumDiv";
                abilityDiv.appendChild(this.getSeperator());
                abilityDiv.style.pageBreakInside = 'avoid';
                abilityDiv.style.display = "inline-block";
                const abilityParagraph: HTMLParagraphElement = document.createElement('p');
                abilityParagraph.innerHTML = `<h5>${ability.name}</h5>${Abilities[ability.name]}`;
                abilityParagraph.style.padding = "1em";
                abilityParagraph.style.borderRadius = "1em";
                abilityParagraph.style.borderWidth = "0.2em";
                abilityParagraph.style.borderStyle = "groove";
                abilityParagraph.style.borderColor = "black";
                abilityParagraph.style.textAlign = "justify";
                abilityParagraph.style.width = "3.5in";
                abilityParagraph.style.minHeight = "2.5in";
                abilityParagraph.style.fontSize = Abilities[ability.name].length > 850 ? "8px" : Abilities[ability.name].length > 600 ? "10px" : "12px";
                abilityParagraph.style.backgroundImage = abilityBackground;
                abilityParagraph.style.backgroundSize = '100%';
                abilityParagraph.style.backgroundRepeat = 'no-repeat';
                abilityParagraph.style.backgroundPosition = 'center';
                abilityDiv.appendChild(abilityParagraph);
                abilitiesDiv.appendChild(abilityDiv);
                abilityDiv.appendChild(this.getSeperator());
            });
        }        
    }

    private fillSpells(): void {
        const usedSpells: Array<Spell> = []
        const spellsDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('spells');
        spellsDiv.innerHTML = "";
        Object.keys(Spells).forEach((key: string) => {
            Spells[key].forEach((availableSpell: Spell) => {
                this.armySelection.getSelectedUnits().forEach((unit: SelectedUnit) => {
                    unit.spellList?.forEach((spell: Spell) => {
                        if (spell.name === availableSpell.name && !usedSpells.find((usedSpell: Spell) => usedSpell.name === spell.name)) {
                            usedSpells.push(spell);
                        }
                    })
                })
            })
        })
        if (usedSpells.length > 0) {
            this.isCompendiumContainerFilled = true;
            const headline: HTMLHeadingElement = document.createElement('h3');
            headline.className = "text-center";
            headline.innerHTML = "SPELLS";
            spellsDiv.appendChild(this.getSeperator());
            spellsDiv.appendChild(headline);
            usedSpells.sort((a: Spell, b: Spell) => a.name < b.name ? 0 : 1).forEach((spell: Spell) => {
                const spellDiv: HTMLDivElement = document.createElement('div');
                spellDiv.className = "compendiumDiv";
                spellDiv.appendChild(this.getSeperator());
                spellDiv.style.pageBreakInside = 'avoid';
                spellDiv.style.display = "inline-block";
                const spellParagraph: HTMLParagraphElement = document.createElement('p');
                spellParagraph.innerHTML = `<h5>${spell.name} (CN ${spell.castingNumber})</h5>${spell.description}`;
                spellParagraph.style.padding = "1em";
                spellParagraph.style.borderRadius = "1em";
                spellParagraph.style.borderWidth = "0.2em";
                spellParagraph.style.borderStyle = "groove";
                spellParagraph.style.borderColor = "black";
                spellParagraph.style.textAlign = "justify";
                spellParagraph.style.width = "3.5in";
                spellParagraph.style.minHeight = "2.5in";
                spellParagraph.style.fontSize = "12px";
                const spelllist: string = Object.keys(Spells).find((key) => Spells[key].some((spelllistSpell: Spell) => spelllistSpell.name === spell.name));
                switch (spelllist) {
                    case 'Dwarf':
                        spellParagraph.style.backgroundImage = dwarfBackground;        
                        break;
                    case 'Elf':
                        spellParagraph.style.backgroundImage = elfBackground;        
                        break;
                    case 'General':
                        spellParagraph.style.backgroundImage = generalBackground;        
                        break;
                    case 'Goblin and Orc':
                        spellParagraph.style.backgroundImage = orcBackground;        
                        break;
                    case 'Human':
                        spellParagraph.style.backgroundImage = humanBackground;        
                        break;
                    case 'Undead':
                        spellParagraph.style.backgroundImage = undeadBackground;        
                        break;
                    case 'Halfling':
                        spellParagraph.style.backgroundImage = halflingBackground;        
                        break;
                    default:
                        spellParagraph.style.backgroundImage = generalBackground;
                        break;
                }
                spellParagraph.style.backgroundSize = '100%';
                spellParagraph.style.backgroundRepeat = 'no-repeat';
                spellParagraph.style.backgroundPosition = 'center';
                spellDiv.appendChild(spellParagraph);
                spellsDiv.appendChild(spellDiv);
                spellDiv.appendChild(this.getSeperator());
            });
        }
    }

    private fillItems(): void {
        const usedItems: Array<Item> = []
        const itemsDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('items');
        itemsDiv.innerHTML = "";
        MagicalItems.items.forEach((item: Item) => {
            this.armySelection.getSelectedUnits().forEach((unit: SelectedUnit) => {
                unit.selectedOptions?.forEach((option: Option) => {
                    if (option.name === item.name && !usedItems.find((usedItem: Item) => usedItem.name === option.name)) {
                        usedItems.push(<Item> option);
                    }
                })
            })
        })
        if (usedItems.length > 0) {
            this.isCompendiumContainerFilled = true;
            const headline: HTMLHeadingElement = document.createElement('h3');
            headline.className = "text-center";
            headline.innerHTML = "MAGICAL ITEMS";
            itemsDiv.appendChild(this.getSeperator());
            itemsDiv.appendChild(headline);
            usedItems.sort((a: Item, b: Item) => a.name < b.name ? 0 : 1).forEach((item: Item) => {
                const itemDiv: HTMLDivElement = document.createElement('div');
                itemDiv.className = "compendiumDiv";
                itemDiv.appendChild(this.getSeperator());
                itemDiv.style.pageBreakInside = 'avoid';
                itemDiv.style.display = "inline-block";
                const itemParagraph: HTMLParagraphElement = document.createElement('p');
                itemParagraph.innerHTML = `<h5>${item.name} (${item.points} Pts)</h5>${item.description}`;
                itemParagraph.style.padding = "1em";
                itemParagraph.style.borderRadius = "1em";
                itemParagraph.style.borderWidth = "0.2em";
                itemParagraph.style.borderStyle = "groove";
                itemParagraph.style.borderColor = "black";
                itemParagraph.style.textAlign = "justify";
                itemParagraph.style.width = "3.5in";
                itemParagraph.style.minHeight = "2.5in";
                itemParagraph.style.fontSize = "12px";
                itemParagraph.style.backgroundImage = itemBackground;
                itemParagraph.style.backgroundSize = '100%';
                itemParagraph.style.backgroundRepeat = 'no-repeat';
                itemParagraph.style.backgroundPosition = 'center';
                itemDiv.appendChild(itemParagraph);
                itemsDiv.appendChild(itemDiv);
                itemDiv.appendChild(this.getSeperator());
            });
        }
    }

    private fillTraits(): void {
        const usedTraits: Array<HeroicTrait> = []
        const traitsDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('traits');
        traitsDiv.innerHTML = "";
        HeroicTraits.traits.forEach((trait: HeroicTrait) => {
            this.armySelection.getSelectedUnits().forEach((unit: SelectedUnit) => {
                unit.selectedOptions?.forEach((option: Option) => {
                    if (option.name === trait.name && !usedTraits.find((usedTrait: HeroicTrait) => usedTrait.name === option.name)) {
                        usedTraits.push(<HeroicTrait> option);
                    }
                })
            })
        })
        if (usedTraits.length > 0) {
            this.isCompendiumContainerFilled = true;
            const headline: HTMLHeadingElement = document.createElement('h3');
            headline.className = "text-center";
            headline.innerHTML = "HEROIC TRAITS";
            traitsDiv.appendChild(this.getSeperator());
            traitsDiv.appendChild(headline);
            usedTraits.sort((a: HeroicTrait, b: HeroicTrait) => a.name < b.name ? 0 : 1).forEach((trait: HeroicTrait) => {
                const traitDiv: HTMLDivElement = document.createElement('div');
                traitDiv.className = "compendiumDiv";
                traitDiv.appendChild(this.getSeperator());
                traitDiv.style.pageBreakInside = 'avoid';
                traitDiv.style.display = "inline-block";
                const traitParagraph: HTMLParagraphElement = document.createElement('p');
                traitParagraph.innerHTML = `<h5>${trait.name}</h5>${trait.description}`;
                traitParagraph.style.padding = "1em";
                traitParagraph.style.borderRadius = "1em";
                traitParagraph.style.borderWidth = "0.2em";
                traitParagraph.style.borderStyle = "groove";
                traitParagraph.style.borderColor = "black";
                traitParagraph.style.textAlign = "justify";
                traitParagraph.style.width = "3.5in";
                traitParagraph.style.minHeight = "2.5in";
                traitParagraph.style.fontSize = "12px";
                traitParagraph.style.backgroundImage = heroicBackground;
                traitParagraph.style.backgroundSize = '100%';
                traitParagraph.style.backgroundRepeat = 'no-repeat';
                traitParagraph.style.backgroundPosition = 'center';
                traitDiv.appendChild(traitParagraph);
                traitsDiv.appendChild(traitDiv);
                traitDiv.appendChild(this.getSeperator());
            });
        }
    }

    private fillUniqueTerrains(): void {
        const usedTerrains: Array<Terrain> = []
        const terrainsDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('unique');
        terrainsDiv.innerHTML = "";
        this.availableTerrains.forEach((terrain: Terrain) => {
            if(terrain.unique) {
                this.regionSelection.getChosenTerrains().forEach((chosenTerrain: SelectedTerrain) => {
                    if (chosenTerrain.terrain.name === terrain.name) {
                        usedTerrains.push(terrain);
                    }
                })
            }
        })
        if (usedTerrains.length > 0) {
            this.isCompendiumContainerFilled = true;
            const headline: HTMLHeadingElement = document.createElement('h3');
            headline.className = "text-center";
            headline.innerHTML = "UNIQUE TERRAINS";
            terrainsDiv.appendChild(this.getSeperator());
            terrainsDiv.appendChild(headline);
            usedTerrains.sort((a: Terrain, b: Terrain) => a.name < b.name ? 0 : 1).forEach((terrain: Terrain) => {
                const terrainDiv: HTMLDivElement = document.createElement('div');
                terrainDiv.className = "compendiumDiv";
                terrainDiv.appendChild(this.getSeperator());
                terrainDiv.style.pageBreakInside = 'avoid';
                terrainDiv.style.display = "inline-block";
                const terrainParagraph: HTMLParagraphElement = document.createElement('p');
                terrainParagraph.innerHTML = `<h5>${terrain.name}</h5>${terrain.unique}`;
                terrainParagraph.style.padding = "1em";
                terrainParagraph.style.borderRadius = "1em";
                terrainParagraph.style.borderWidth = "0.2em";
                terrainParagraph.style.borderStyle = "groove";
                terrainParagraph.style.borderColor = "black";
                terrainParagraph.style.textAlign = "justify";
                terrainParagraph.style.width = "14.8cm";
                terrainParagraph.style.minHeight = "10.5cm";
                terrainParagraph.style.fontSize = "12px";
                terrainDiv.appendChild(terrainParagraph);
                terrainsDiv.appendChild(terrainDiv);
                terrainDiv.appendChild(this.getSeperator());
            });
        }
    }

    private printCompendium(): void {
        const kingdomDiv: HTMLElement = document.getElementById("terrainSelection");
        kingdomDiv.className = "container no-print";
        const compendiumDiv: HTMLElement = document.getElementById("compendiumContainer");
        compendiumDiv.className = "container-fluid print";
        const armyDiv: HTMLElement = document.getElementById("armyContainer");
        armyDiv.className = "container no-print";
        const veteransDiv: HTMLElement = document.getElementById("veteransContainer");
        veteransDiv.className = "container no-print";
        window.print();
    }

    private getSeperator(): HTMLDivElement {
        const tableSeperator: HTMLDivElement = document.createElement('div');
        tableSeperator.innerHTML = "&nbsp;";
        tableSeperator.className = "compendiumSeperator";
        return tableSeperator;
    }
}
export default Compendium;