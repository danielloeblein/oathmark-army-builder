import Stats from "./stats";
class Option {
    public name: string;
    public points?: number;
    public battleHonors?: number;
    public stats?: Stats;
    public description? : string;
};
export default Option;