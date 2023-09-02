
export class DiceResult {
    public polyhedral: [number,
        number][];
    public success: number;
    public advantage: number;
    public triumph: number;
    public failure: number;
    public threat: number;
    public despair: number;
    public lightside: number;
    public darkside: number;

    constructor(
        {
            polyhedral = [] as [number, number][],
            success = 0,
            advantage = 0,
            triumph = 0,
            failure = 0,
            threat = 0,
            despair = 0,
            lightside = 0,
            darkside = 0
        }) {
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
