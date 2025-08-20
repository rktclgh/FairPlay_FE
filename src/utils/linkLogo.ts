export function getLogoByUrl(url: string): string {
    const DOMAIN_LOGOS: Array<{ pattern: RegExp; logo: string }> = [
        { pattern: /naver|smartstore|booking\.naver|ticket\.naver/, logo: "/logos/naver.gif" },
        { pattern: /kakao|daum/,                           logo: "/logos/kakao.png" },
        { pattern: /interpark/,                            logo: "/logos/interpark.png" },
        { pattern: /yes24/,                                logo: "/logos/yes24.jpg" },
        { pattern: /ticketlink/,                           logo: "/logos/ticketlink.png" },
        { pattern: /melon/,                                logo: "/logos/melon.png" },
    ];

    try {
        const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
        const hit = DOMAIN_LOGOS.find(({ pattern }) => pattern.test(host));
        return hit?.logo ?? "/logos/default.svg";
    } catch {
        // URL 파싱 실패 시 전체 문자열에서라도 체크
        const lower = (url || "").toLowerCase();
        const hit = DOMAIN_LOGOS.find(({ pattern }) => pattern.test(lower));
        return hit?.logo ?? "/logos/default.svg";
    }
}