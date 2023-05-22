import * as Preconditions from "../../preconditions";
import { TimeUtilities } from "../../utilities/TimeUtility";

declare module "@sapphire/framework" {
    interface Preconditions {
        OwnerOnly: never;
        DeveloperOnly: never;
    }

    const enum Identifiers {
        PreconditionOwnerOnly = "preconditionOwnerOnly",
        PreconditionDeveloperOnly = "preconditionDeveloperOnly",
    }
}

declare module "@sapphire/plugin-utilities-store" {
    export interface Utilities {
        time: TimeUtilities;
    }
}
