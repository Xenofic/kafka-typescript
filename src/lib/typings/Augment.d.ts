import * as Preconditions from "../../preconditions";

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
