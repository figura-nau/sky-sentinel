import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import "./app.css";
import "../i18n.js";
import type { Route } from "./+types/root";
import UavDataProvider from "@/providers/UavDataProvider";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useTranslation } from "react-i18next";
import ThemeContextProvider from "@/providers/ThemeProvider";
import { Suspense, useEffect, useState } from "react";
import { CookiesProvider } from "react-cookie";
import { getLocale, initI18nServer } from "../i18n.server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: Route.LinksFunction = () => [
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
  const { telemetryEvents } = useSocketConnection();
  const { i18n } = useTranslation();
  const [queryClient] = useState(() => new QueryClient());

  // Update cookie when language changes
  useEffect(() => {
    if (i18n.language) {
      document.cookie = `i18n-locale=${i18n.language}; path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider defaultSetOptions={{ path: "/" }}>
        <UavDataProvider uavData={telemetryEvents}>
          <ThemeContextProvider>
            <Suspense fallback="Loading...">
              <Outlet />
            </Suspense>
          </ThemeContextProvider>
        </UavDataProvider>
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
    <main className="pt-16 p-4 container mx-auto flex flex-col justify-center items-center font-mono">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
