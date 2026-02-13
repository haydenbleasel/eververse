"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import JSZip from "jszip";
import { DownloadIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { exportAll } from "@/actions/export";

export const ExportButton = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const result = await exportAll();

      if ("error" in result) {
        throw result.error;
      }

      const zip = new JSZip();

      for (const [filename, csv] of Object.entries(result.data)) {
        zip.file(filename, csv);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "export.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={handleExport}>
      {loading ? (
        <LoaderIcon className="animate-spin" size={16} />
      ) : (
        <DownloadIcon size={16} />
      )}
      {loading ? "Exporting..." : "Export all data"}
    </Button>
  );
};
