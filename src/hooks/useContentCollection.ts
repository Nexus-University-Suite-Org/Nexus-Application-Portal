import { useEffect, useMemo, useState } from "react";

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

const buildUrl = (path: string) =>
  `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}${path}`;

const collectionApiMap: Record<string, string> = {
  news: "news",
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
        const response = await fetch(buildUrl(`v1/content/${apiCollection}`));
        if (!response.ok) {
          throw new Error(`Content API returned ${response.status}`);
        }
        const result = await response.json();
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          setData(result as T[]);
          setIsUsingFallback(false);
        }
      } catch (err) {
        if (!cancelled) {
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
