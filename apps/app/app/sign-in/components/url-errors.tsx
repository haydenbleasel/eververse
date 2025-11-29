"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const UrlErrors = () => {
  const params = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) {
      return;
    }

    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      toast.error(error, { description: errorDescription });
      shown.current = true;
    }
  }, [params]);

  return null;
};
