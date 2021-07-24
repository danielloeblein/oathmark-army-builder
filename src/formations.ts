import RegionSelection from "./regionSelection";
import SelectedUnit from "./models/selectedUnit";
import Formation from "./models/formation";
import SelectedFormation from "./models/selectedFormation";
import Special from "./models/special";
import Option from "./models/option";
import Stats from "./models/stats";
import ArmySelection from "./armySelection";

class Formations {
    private regionSelection: RegionSelection;
    private armySelection: ArmySelection;
    private selectedFormations: Array<SelectedFormation>;

    constructor(regionSelection: RegionSelection, armySelection: ArmySelection) {
        this.regionSelection = regionSelection;
        this.armySelection = armySelection;
        this.selectedFormations = [];
    }

    getAvailableFormations(unit: SelectedUnit) {
        const availableFormations: Array<Formation> = [];
        this.regionSelection.getChosenTerrains().forEach(terrain => {
            const formation: Formation = terrain.terrain.formation;
            if (formation) {
                let usedFormations: number = 0; 
                this.armySelection.getSelectedUnits().forEach((selectedUnit: SelectedUnit) => {
                    if (selectedUnit.selectedOptions?.some((selectedOption: Option) => selectedOption.name === formation.name)) {
                        usedFormations++;
                    }
                })
                let isAllowed = usedFormations < 4;
                if (isAllowed) {                    
                    if ((formation.restrictions?.unitSize?.min && formation.restrictions?.unitSize?.min > unit.quantity) 
                    || (formation.restrictions?.unitSize?.max && formation.restrictions?.unitSize?.max < unit.quantity)) {
                        isAllowed = false;
                    }
                    if (formation.restrictions?.units) {
                        isAllowed = isAllowed && formation.restrictions.units.some((unitName: string) => unit.unit.name.includes(unitName));
                    }
                    if (formation.restrictions?.special) {
                        isAllowed = isAllowed && formation.restrictions.special.some((specialName: string) => unit.unit.stats.special?.some((specialAbility: Special) => specialAbility.name === specialName));
                    }
                    if (formation.restrictions?.excludedSpecial) {
                        isAllowed = isAllowed && formation.restrictions.excludedSpecial.some((specialName: string) => unit.unit.stats.special?.every((specialAbility: Special) => specialAbility.name !== specialName));
                    }
                    if (formation.restrictions?.equipment) {
                        isAllowed = isAllowed && formation.restrictions.equipment.some((equipmentName: string) => unit.unit.equipment.some((equipment: string) => equipment.includes(equipmentName)));
                    }
                    console.log(formation.restrictions);
                    console.log(unit.unit.stats);
                    console.log(isAllowed);
                    if (formation.restrictions?.base) {
                        isAllowed = isAllowed && formation.restrictions.base === unit.unit.stats.base;
                    }
                    if (isAllowed) {
                        availableFormations.push(formation);        
                    }
                }
            }
        });
        const formationOptions: Array<Option> = [];
        availableFormations.forEach((formation: Formation) => {
            const getPointsByRace = () => {
                let points = 0;
                Object.keys(formation.points).forEach((race: string) => {
                    if (unit.unit.name.includes(race)) {
                        points = formation.points[race];
                    }
                })
                return points;
            };
            const points: number = formation.points ? formation.points.all ? formation.points.all : getPointsByRace() : 0;
            const stats: Stats = {
                unitSize: formation.unitSize ? formation.unitSize : unit.unit.stats.unitSize,
                special: [
                    {
                        "name": formation.name
                    }
                ]
            }
            formationOptions.push({
                name: formation.name,
                points: points,
                stats: stats
            })
        })
        return formationOptions;
    }

}
export default Formations;