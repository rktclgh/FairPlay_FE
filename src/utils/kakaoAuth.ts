const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_CALLBACK_PATH = "/auth/kakao/callback";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getKakaoRedirectUri = (): string => {
  const currentOrigin = window.location.origin;
  const configuredFrontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL?.trim();
  const baseUrl =
    currentOrigin.includes("localhost") && configuredFrontendBaseUrl
      ? configuredFrontendBaseUrl
      : currentOrigin;

  return `${stripTrailingSlash(baseUrl)}${KAKAO_CALLBACK_PATH}`;
};

export const buildKakaoAuthorizeUrl = (): { url: string; redirectUri: string } | null => {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim();
  if (!clientId) return null;

  const redirectUri = getKakaoRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return {
    url: `${KAKAO_AUTHORIZE_URL}?${params.toString()}`,
    redirectUri,
  };
};
