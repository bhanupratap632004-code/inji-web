import { buildClaimTree, collectSdClaimPaths, parseClaimPath } from "../../utils/sdClaimsTree";

describe("parseClaimPath", () => {
    test("splits dotted SD-JWT paths on dots", () => {
        expect(parseClaimPath("$.address.city")).toEqual(["address", "city"]);
        expect(parseClaimPath("$.given_name")).toEqual(["given_name"]);
    });

    test("keeps an array index on its key", () => {
        expect(parseClaimPath("$.nationalities[0]")).toEqual(["nationalities[0]"]);
    });

    test("keeps a dotted mdoc namespace in one segment", () => {
        expect(parseClaimPath("$['org.iso.18013.5.1']['family_name']")).toEqual([
            "org.iso.18013.5.1",
            "family_name",
        ]);
    });

    test("handles mixed bracket and dot segments and escaped quotes", () => {
        expect(parseClaimPath("$['org.iso.18013.5.1'].family_name")).toEqual([
            "org.iso.18013.5.1",
            "family_name",
        ]);
        expect(parseClaimPath("$['org.example.1']['it\\'s']")).toEqual([
            "org.example.1",
            "it's",
        ]);
    });

    test("does not loop on an unterminated bracket", () => {
        expect(parseClaimPath("$['org.iso")).toEqual(["['org.iso"]);
    });
});

describe("buildClaimTree for mdoc claims", () => {
    test("groups data elements under their namespace", () => {
        const sdClaims = [
            "$['org.iso.18013.5.1']['given_name']",
            "$['org.iso.18013.5.1']['family_name']",
        ];
        const tree = buildClaimTree([], sdClaims);

        expect(tree).toHaveLength(1);
        const group = tree[0];
        expect(group.kind).toBe("group");
        if (group.kind !== "group") {
            return;
        }
        expect(group.label).toBe("org.iso.18013.5.1");
        expect(group.children.map((child) => child.label)).toEqual([
            "Family Name",
            "Given Name",
        ]);
        expect(collectSdClaimPaths(tree).sort()).toEqual([...sdClaims].sort());
    });
});
