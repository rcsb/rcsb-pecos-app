export class InteractionsManager {

    targetToQuery = new Map();
    queryToTarget = new Map();

    constructor(alignment) {
        alignment.forEach(a=>{
            if(a.query_end - a.query_begin !== a.target_end - a.target_begin)
                throw new Error("ERROR: Inconsistent alignment boundaries");
            let targetPointer = 0;
            for(let n = a.query_begin; n <= a.query_end; n++) {
                this.queryToTarget.set(n,a.target_begin + targetPointer);
                this.targetToQuery.set(a.target_begin + targetPointer, n);
                targetPointer++;
            }
        });
    }

    getTargetPosition(queryPosition) {
        return this.queryToTarget.get(queryPosition);
    }

    getQueryPosition(targetPosition) {
        return this.targetToQuery.get(targetPosition);
    }

    getTargetRange(queryRange) {
        const queryBegin = queryRange.begin;
        const queryEnd = queryRange.end;
        const out = { begin: 0,end: 0 };
        while(queryBegin <= queryEnd) {
            if(this.queryToTarget.get(queryBegin) && out.begin === 0)
                out.begin = this.queryToTarget.get(queryBegin);
            if(this.queryToTarget.get(queryEnd) && out.end === 0)
                out.end = this.queryToTarget.get(queryEnd);
            if(out.begin !== 0 && out.end !== 0)
                return out;
        }
        return undefined;
    }

    getQueryRange(targetRange) {
        const targetBegin = targetRange.begin;
        const targetEnd = targetRange.end;
        const out = { begin: 0,end: 0 };
        while(targetBegin <= targetEnd) {
            if(this.targetToQuery.get(targetBegin) && out.begin === 0)
                out.begin = this.targetToQuery.get(targetBegin);
            if(this.targetToQuery.get(targetEnd) && out.end === 0)
                out.end = this.targetToQuery.get(targetEnd);
            if(out.begin !== 0 && out.end !== 0)
                return out;
        }
        return undefined;
    }

}