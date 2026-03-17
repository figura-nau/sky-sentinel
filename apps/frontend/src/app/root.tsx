import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
} from "react-router";

import "./app.css";
import "../i18n.js";
import type { Route } from "./+types/root";
import { useTranslation } from "react-i18next";
import ThemeContextProvider from "@/providers/ThemeProvider";
import { Suspense, useEffect, useState } from "react";
import { CookiesProvider } from "react-cookie";
import { getLocale, initI18nServer } from "../i18n.server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.ico/favicon.svg",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon.ico/favicon-96x96.png",
    sizes: "96x96",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/favicon.ico/apple-touch-icon.png",
  },
  { rel: "shortcut icon", href: "/favicon.ico/favicon.ico" },
  { rel: "manifest", href: "/favicon.ico/site.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await getLocale(request);
  // Ensure i18n is initialized on server for this request
  await initI18nServer(locale);
  return { locale };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useLoaderData<typeof loader>() || { locale: "en" };
  const { i18n } = useTranslation();

  // Sync i18n language with loader data on initial client render only once
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, []);

  return (
    <html lang={i18n.language} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { i18n } = useTranslation();
  const [queryClient] = useState(() => new QueryClient());

  // Update cookie when language changes
  useEffect(() => {
    if (i18n.language) {
      document.cookie = `i18n-locale=${i18n.language}; Max-Age=31536000`;
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider defaultSetOptions={{ path: "/", sameSite: "lax" }}>
        <ThemeContextProvider>
          <Suspense fallback="Loading...">
            <Outlet />
          </Suspense>
        </ThemeContextProvider>
      </CookiesProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  let message = t("errors.oops");
  let details = t("errors.unexpected");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : t("errors.error");
    details =
      error.status === 404 ? t("errors.notFound") : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-background transition-colors duration-500 font-mono">
      {/* Background decoration - uses theme primary/destructive colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-destructive/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-2xl border border-border bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Header - Master Caution Style using destructive theme color */}
        <div className="bg-destructive/10 border-b border-border p-6 flex items-center gap-4">
          <div className="p-3 bg-destructive/20 rounded-xl text-destructive animate-pulse shadow-[0_0_15px_rgba(var(--destructive),0.2)]">
            <AlertTriangle className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              {message}
            </h1>
            <p className="text-muted-foreground  text-[10px] mt-1 uppercase tracking-widest opacity-70">
              Critical System Failure // Master Caution
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {t("errors.diagnostic_report")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{details}</p>
          </div>

          {stack && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-r from-destructive/10 to-transparent blur opacity-25 transition duration-1000"></div>
              <div className="relative bg-muted/30 border border-border p-4 rounded-lg overflow-hidden ">
                <pre className="text-[10px] md:text-xs text-muted-foreground/80 overflow-x-auto max-h-50 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                  <code>{stack}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Actions - using theme buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              asChild
              variant="default"
              className="flex-1 h-12 text-base font-semibold cursor-pointer"
            >
              <Link to="/">
                <Home className="mr-2 size-5" />
                {t("errors.returnToBase")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-semibold cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="mr-2 size-5" />
              {t("errors.resetSystems")}
            </Button>
          </div>
        </div>

        {/* Footer - using muted theme color */}
        <div className="bg-muted/50 px-8 py-4 flex justify-between items-center text-[10px]  text-muted-foreground/60 uppercase tracking-tighter">
          <span>SkySentinel OS stable</span>
        </div>
      </div>
    </main>
  );
}
