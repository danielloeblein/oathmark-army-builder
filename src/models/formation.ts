class Formation {
    name: string;
    restrictions?: {
        units?: Array<string>;
        unitSize?: {
            min: number;
            max: number;
        }
        special?: Array<string>;
        excludedSpecial?: Array<string>;
        equipment?: Array<string>;
        base? : string;
    };
    points?: {
        all: number;
        Human: number;
        Skeletal: number;
        Halfling: number;
        Elf: number;
        Dwarf: number;
        Revenant: number;
    };
    unitSize?: number;
};
export default Formation;