import Stats from "./stats";
import Option from "./option";
class Unit {
    public name: string;
    public count?: number;
    public type?: string;
    public stats?: Stats;
    public equipment?: Array<string>;
    public options?: Array<Option>;
    public spelllist?: Array<string>;
};
export default Unit;