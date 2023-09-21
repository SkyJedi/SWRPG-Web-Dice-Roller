
export class DiceRoll {
    public yellow: number[];
    public green: number[];
    public blue: number[];
    public red: number[];
    public purple: number[];
    public black: number[];
    public white: number[];
    public polyhedral: [number, number][];
    public success: number[];
    public advantage: number[];
    public triumph: number[];
    public failure: number[];
    public threat: number[];
    public despair: number[];
    public lightside: number[];
    public darkside: number[];

    constructor(
        {
            yellow = [] as number[],
            green = [] as number[],
            blue = [] as number[],
            red = [] as number[],
            purple = [] as number[],
            black = [] as number[],
            white = [] as number[],
            polyhedral = [] as [number, number][],
            success = [] as number[],
            advantage = [] as number[],
            triumph = [] as number[],
            failure = [] as number[],
            threat = [] as number[],
            despair = [] as number[],
            lightside = [] as number[],
            darkside = [] as number[]
        }) {
        this.yellow = yellow;
        this.green = green;
        this.blue = blue;
        this.red = red;
        this.purple = purple;
        this.black = black;
        this.white = white;
        this.polyhedral = polyhedral;
        this.success = success;
        this.advantage = advantage;
        this.triumph = triumph;
        this.failure = failure;
        this.threat = threat;
        this.despair = despair;
        this.lightside = lightside;
        this.darkside = darkside;
    }
}
