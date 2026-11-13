export function driveImageReference(raw: string): { fileId: string; resourceKey?: string } | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    let fileId: string | null = null;
    if (url.hostname === "drive.google.com" || url.hostname === "www.drive.google.com") {
      fileId = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
        || (["/open", "/uc", "/thumbnail"].includes(url.pathname) ? url.searchParams.get("id") : null);
    } else if (url.hostname === "lh3.googleusercontent.com") {
      fileId = url.pathname.match(/^\/d\/([a-zA-Z0-9_-]+)/)?.[1] || null;
    }
    if (!fileId || !/^[a-zA-Z0-9_-]{5,200}$/.test(fileId)) return null;
    const resourceKey = url.searchParams.get("resourcekey");
    return { fileId, ...(resourceKey && /^[a-zA-Z0-9_-]{1,200}$/.test(resourceKey) ? { resourceKey } : {}) };
  } catch {
    return null;
  }
}

export function productImageUrl(raw = ""): string {
  const value = raw.trim();
  let legacy:{fileId:string;resourceKey?:string}|null=null;
  try{
    const proxy=new URL(value,'https://www.vartana.id');
    if(['www.vartana.id','vartana.id'].includes(proxy.hostname)&&proxy.pathname==='/api/product-image'&&proxy.searchParams.has('fileId')){
      const fileId=proxy.searchParams.get('fileId')||'',resourceKey=proxy.searchParams.get('resourceKey')||'';
      if(!/^[a-zA-Z0-9_-]{5,200}$/.test(fileId)||(resourceKey&&!/^[a-zA-Z0-9_-]{1,200}$/.test(resourceKey)))return '';
      legacy={fileId,...(resourceKey?{resourceKey}:{})};
    }
  }catch{}
  const drive = driveImageReference(value)||legacy;
  if (drive) {
    const params = new URLSearchParams();
    if (drive.resourceKey) params.set("resourceKey", drive.resourceKey);
    return `/api/product-image/${drive.fileId}${params.size?'?'+params:''}`;
  }
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (["drive.google.com", "www.drive.google.com"].includes(url.hostname)) return "";
    return url.toString();
  } catch {
    return "";
  }
}
