import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales,

  // 默认语言
  defaultLocale,

  // 禁用自动语言检测，强制使用默认语言
  localeDetection: false,

  // 默认语言不显示前缀，其他语言显示前缀
  // 英文: /list
  // 中文: /zh/list
  localePrefix: "as-needed",
});

/**
 * 需要认证保护的路径列表
 * 访问这些路径需要登录，否则重定向到登录页
 */
const PROTECTED_PATHS = [
  //"/profile",       // 个人中心
  "/list",          // 列表页
  //"/server-list",   // 服务器列表
  //"/clinet-list",   // 客户端列表
  // 可以根据需要添加更多路径
];

/**
 * 检查路径是否需要认证保护
 */
function isProtectedPath(pathname: string): boolean {
  // 移除语言前缀（如 /zh/profile -> /profile）
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, "") || "/";

  return PROTECTED_PATHS.some(path =>
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );
}

/**
 * 检查是否为公开的认证页面（登录/注册）
 */
function isAuthPage(pathname: string): boolean {
  return pathname === "/login" ||
         pathname === "/register" ||
         pathname.endsWith("/login") ||
         pathname.endsWith("/register");
}

/**
 * 自定义中间件：模板检测 + 认证保护 + i18n 处理
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 获取认证 token
  const token = request.cookies.get("auth_token")?.value;

  // 1. 已登录用户访问登录/注册页 -> 重定向到首页
  if (isAuthPage(pathname) && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2. 未登录用户访问受保护页面 -> 重定向到登录页
  if (isProtectedPath(pathname) && !token) {
    const url = request.nextUrl.clone();

    // 保留语言前缀
    const locale = pathname.startsWith("/zh") ? "/zh" : "";
    url.pathname = `${locale}/login`;

    // 可选：保存原始路径，登录后跳转回来
    url.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(url);
  }

  // 3. 执行 i18n 中间件
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  // 4. 多模板检测与设置
  let template = request.cookies.get("template")?.value;
  const templateParam = request.nextUrl.searchParams.get("template");
  if (templateParam) {
    template = templateParam;
  }

  if (!template) {
    const host = request.headers.get("host") ?? "";
    // TODO: 替换为根据域名查询商户配置的接口
    if (host === "marerex.com") {
      template = "enterprise"; // marerex.com 对应企业版模板
    } else if (host === "junyos.com") {
      template = "default";    // junyos.com 对应默认模板
    }
  }

  if (!template) template = "default";

  const matchedLocale = locales.find((locale) =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  const localePrefix = matchedLocale ? `/${matchedLocale}` : `/${defaultLocale}`;
  const pathWithoutLocale = matchedLocale ? pathname.slice(localePrefix.length) : pathname;

  if (pathWithoutLocale.startsWith("/tpl/")) {
    return intlResponse;
  }

  const url = request.nextUrl.clone();
  url.pathname = `${localePrefix}/tpl/${template}${pathWithoutLocale || "/"}`;

  const response = NextResponse.rewrite(url);

  for (const cookie of intlResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  response.cookies.set("template", template, {
    path: "/",
    httpOnly: process.env.NODE_ENV === "production",
  });

  response.headers.set("x-template", template);

  return response;
}

export const config = {
  // 匹配除了 api、_next、静态文件等之外的所有路径
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
