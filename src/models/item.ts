import Stats from './stats';

class Item {
    public name: string;
    public points: number;
    public description: string;
    public stats? : Stats;
}
export default Item;