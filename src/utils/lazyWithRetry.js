import { lazy } from "react";

const buildRetryKey = (moduleName) => `lazy-retry:${moduleName}`;

const normalizeErrorMessage = (error) =>
  String(error?.message || error || "").toLowerCase();

const shouldRetryLazyImport = (error) => {
  const message = normalizeErrorMessage(error);

  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("loading chunk") ||
    message.includes("chunkloaderror")
  );
};

export const lazyWithRetry = (factory, moduleName) =>
  lazy(async () => {
    const retryKey = buildRetryKey(moduleName);
    const hasRetried = sessionStorage.getItem(retryKey) === "1";

    try {
      const component = await factory();
      sessionStorage.removeItem(retryKey);
      return component;
    } catch (error) {
      if (!hasRetried && shouldRetryLazyImport(error)) {
        sessionStorage.setItem(retryKey, "1");
        window.location.reload();
        return new Promise(() => {});
      }

      sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
