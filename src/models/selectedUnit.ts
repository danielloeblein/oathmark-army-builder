import Unit from "./unit";
import Option from "./option";
import Spell from "./spell";
class SelectedUnit {
    public unit: Unit;
    public quantity: number;
    public unitId: number;
    public selectedOptions: Array<Option>;
    public battleHonors: number;
    public name: string;
    public spellList: Array<Spell>;
    public xp: number;
}
export default SelectedUnit;