import type { FailureLog } from "@prisma/client";
import { useEffect, useState } from "react";

export const useGetFailureLogs = () => {
  const fetchFailures = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }
    const response = await fetch(`${backendUrl}/failures`);
    if (!response.ok) {
      throw new Error(
        `Network error: Failed to fetch failures: ${response.status}`,
      );
    }
    const failureLogs = await response.json();
    return { failureLogs };
  };

  const [failureLogs, setFailureLogs] = useState<FailureLog[]>([]);

  useEffect(() => {
    fetchFailures()
      .then(({ failureLogs }) => {
        console.log("Fetched failure logs:", failureLogs);
        setFailureLogs(failureLogs);
      })
      .catch((error) => {
        console.error("Error fetching failure logs:", error);
      });
  }, []);

  return { failureLogs };
};
