import { useEffect, useMemo, useState } from "react";
import { logDebug } from "@/lib/debugLogger";
import { apiUrl } from "@/lib/apiUrl";

type OrderDirection = "asc" | "desc";

type CollectionOptions = {
  orderBy?: {
    field: string;
    direction?: OrderDirection;
  };
  where?: {
    field: string;
    operator: string;
    value: unknown;
  };
  limit?: number;
};

export type ContentCollectionResult<T> = {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  isUsingFallback: boolean;
};

const collectionApiMap: Record<string, string> = {
  news: "news",
  NewsArticles: "news",
  events: "events",
  gallery: "gallery",
  faqs: "faqs",
  alumni: "alumni",
  partners: "partners",
  scholarships: "scholarships",
  student_stories: "student_stories",
  legal_pages: "legal_pages",
  quick_links: "quick_links",
  courses: "courses",
  AcademicPrograms: "courses",
  faculty: "faculty",
  page_sections: "page_sections",
};

export const useContentCollection = <T extends Record<string, unknown>>(
  collectionName: string,
  fallbackData: T[] = [],
  _options?: CollectionOptions,
): ContentCollectionResult<T> => {
  const [data, setData] = useState<T[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  useEffect(() => {
    const apiCollection = collectionApiMap[collectionName];
    if (!apiCollection) {
      setIsLoading(false);
      setIsUsingFallback(true);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const url = apiUrl(`content/${apiCollection}`);
        logDebug("info", `useContentCollection("${collectionName}") → ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Content API returned ${response.status}`);
        }
        const result = await response.json();
        if (!Array.isArray(result)) {
          logDebug(
            "warn",
            `useContentCollection("${collectionName}") got non-array payload — rendering fallback data`,
          );
        } else {
          logDebug(
            "info",
            `useContentCollection("${collectionName}") loaded ${result.length} item(s) from API`,
          );
        }
        if (!cancelled && Array.isArray(result)) {
          setData(result as T[]);
          setIsUsingFallback(false);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          logDebug(
            "error",
            `useContentCollection("${collectionName}") failed — ${message}. Falling back to static data.`,
          );
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsUsingFallback(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [collectionName]);

  return useMemo<ContentCollectionResult<T>>(
    () => ({ data, isLoading, error, isUsingFallback }),
    [data, isLoading, error, isUsingFallback],
  );
};
