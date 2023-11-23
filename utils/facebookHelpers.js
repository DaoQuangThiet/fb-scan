export function getActIdFromHTMLDoc(docs) {
  return docs
    ?.trim()
    .match(/act=[0-9]*\&/)?.[0]
    .slice(4, -1);
}

export function getAccessTokenFromHTMLDoc(docs) {
  return docs?.match(/EAAB.*?"/)?.[0]?.slice(0, -1);
}
