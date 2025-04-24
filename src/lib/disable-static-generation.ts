// This file provides utilities to prevent Next.js static prerendering
// for routes that depend on dynamic data or API calls

// Export a configuration object that can be used in page files
export const disableStaticGeneration = {
  // Disable static generation and force dynamic rendering
  dynamic: "force-dynamic",

  // Alternatively, you can use this to disable caching
  // and ensure fresh data on each request
  revalidate: 0,
};

// For pages that need additional options beyond just dynamic rendering
export function configureAPIPage(
  options: {
    dynamicParams?: boolean;
    revalidate?: number | false;
    fetchCache?:
      | "auto"
      | "default-cache"
      | "only-cache"
      | "force-cache"
      | "force-no-store"
      | "default-no-store"
      | "only-no-store";
  } = {},
) {
  return {
    // Always force dynamic rendering for API-dependent pages
    dynamic: "force-dynamic",

    // Allow customizing other options
    ...options,
  };
}
