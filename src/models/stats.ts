import Special from "./special";
class Stats {
    public activition? : number;
    public movement? : number;
    public fight? : number;
    public shoot? : number;
    public defense? : number;
    public combatDice? : number;
    public health? : number;
    public points? : number|string;
    public unitSize? : number;
    public base? : string;
    public special? : Array<Special>;
}
export default Stats