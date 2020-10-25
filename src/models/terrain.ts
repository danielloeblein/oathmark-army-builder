import UnitSelection from "./unitSelection";
class Terrain {
    name: string;
    race: string;
    region: number;
    troops?: Array<UnitSelection>;
    unique?: string;
};
export default Terrain;