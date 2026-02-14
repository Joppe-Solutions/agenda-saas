"use client";

import Script from "next/script";

export function JivoChat() {
  return (
    <Script
      id="jivo-chat"
      src="//code.jivosite.com/widget/OcT8FnOQ8X"
      strategy="lazyOnload"
      async
    />
  );
}
