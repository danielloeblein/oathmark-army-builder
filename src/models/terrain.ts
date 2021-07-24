import UnitSelection from "./unitSelection";
import Formation from "./formation";
class Terrain {
    name: string;
    race: string;
    region: number;
    troops?: Array<UnitSelection>;
    unique?: string;
    formation?: Formation;
};
export default Terrain;