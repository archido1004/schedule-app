// 카카오톡 공유 관련 헬퍼. 지금은 클립보드 복사 방식만 지원한다.
// 나중에 Kakao Developers 앱을 등록하면 이 함수들을 Kakao JS SDK
// (Kakao.Share.sendDefault / Kakao.Link) 호출로 교체할 수 있다.

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function buildChannelInviteMessage(channelUrl: string): string {
  return `안녕하세요! 아래 링크에서 카카오톡 채널 추가 부탁드립니다 :)\n${channelUrl}`;
}
