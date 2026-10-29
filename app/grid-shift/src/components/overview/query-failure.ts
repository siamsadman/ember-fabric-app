import type { SemanticModelQueryResult } from "@microsoft/rayfin-connector-fabric-semanticmodel";

type QueryError = Extract<SemanticModelQueryResult, { status: "error" }>["error"];
export type QueryErrorCategory = QueryError["category"];

export interface QueryFailure {
    category: QueryErrorCategory;
    message: string;
}

/** Returns the failure of a finished query, if it failed. */
export function queryFailure(data: SemanticModelQueryResult | undefined): QueryFailure | undefined {
    if (data?.status !== "error") return undefined;
    return { category: data.error.category, message: data.error.message };
}
