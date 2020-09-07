import { Expect, Test, TestCase, TestFixture, Timeout } from "alsatian";
import * as tru from "./traverse-urls";

@TestFixture("URL follow/transform")
export class TestSuite {
    @TestCase("https://t.co/ELrZmo81wI", "https://www.foxnews.com/lifestyle/photo-of-donald-trump-look-alike-in-spain-goes-viral", 5)
    @TestCase("http://ui.constantcontact.com/sa/fwtf.jsp?llr=jwcorpsab&m=1119360584393&ea=periodicals%2Bhealthit-answersmedianetwork%40medigy.cc&a=1134632546554", "http://ui.constantcontact.com/sa/fwtf.jsp?llr=jwcorpsab&m=1119360584393&ea=periodicals%2Bhealthit-answersmedianetwork%40medigy.cc&a=1134632546554", 1)
    @Timeout(10000)
    @Test("Traverse URL")
    async testTraverse(originalURL: string, finalURL: string, redirects: number): Promise<void> {
        const visitResults = await tru.traverse(originalURL);
        Expect(visitResults).toBeDefined();
        Expect(visitResults.length).toBe(redirects);
        Expect(visitResults[visitResults.length - 1].url).toBe(finalURL);
    }

    @Timeout(10000)
    @Test("Follow URL and test granular visit results")
    async testVistResults(): Promise<void> {
        const visitResults = await tru.traverse("https://t.co/ELrZmo81wI");
        Expect(visitResults).toBeDefined();
        Expect(visitResults.length).toBe(5);

        Expect(tru.isContentRedirectResult(visitResults[0])).toBe(true);
        Expect(tru.isHttpRedirectResult(visitResults[1])).toBe(true);
        Expect(tru.isHttpRedirectResult(visitResults[2])).toBe(true);
        Expect(tru.isHttpRedirectResult(visitResults[3])).toBe(true);

        const finalResult = visitResults[4];
        Expect(tru.isTerminalTextContentResult(finalResult)).toBe(true);
        if (tru.isTerminalTextContentResult(finalResult)) {
            Expect(finalResult.url).toBe("https://www.foxnews.com/lifestyle/photo-of-donald-trump-look-alike-in-spain-goes-viral");
            Expect(finalResult.httpResponse.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
            Expect(finalResult.contentText).toBeDefined();
        }
    }

    @Timeout(120000)
    @Test("Call API and return results")
    async testCallAPI(): Promise<void> {
        // https://www.medigy.com/news/2020/08/21/ehrintelligence.com-how-va-is-attempting-to-increase-interoperability-boost-its-ehr-system/
        // const title = "How VA is Attempting to Increase Interoperability, Boost its EHR System";
        const input = "While the Department of Veterans Affairs (VA) has faced considerable health IT challenges in the past few years, the VA is attempting to increase its interoperability and enhance its health information exchange and new EHR system. The OIG HIE report found training challenges, the need for increased community partners, the use of community coordinators, and technology issues that need to be addressed to enhance the VA’s ability to effectively utilize its HIEs and the ability to exchange patient data. These reports and a basic need for increased interoperability have triggered a series of VA health IT advancements and optimizations over the past few months. Most recently, the organization has developed a joint HIE in partnership with the Department of Defense (DoD) and a Veterans Data Integration and Federation Enterprise Platform to promote interoperability. The VA has also looked into robotic process automation to help transfer its paper records over to its new EHR system.";
        const result = await tru.call(
            "https://meshb.nlm.nih.gov/api/MOD",
            { input },
            new tru.JsonCallOptions({ fetchTimeOut: 120000 })
        );
        Expect(result).toBeDefined();
        Expect(tru.isCallResult(result)).toBe(true);
    }
}
