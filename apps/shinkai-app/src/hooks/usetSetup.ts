// hooks/useSetup.ts
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ApiConfig } from "@shinkai/shinkai-message-ts/api";

export const useSetup = () => {
  const { setupDetailsState } = useSelector((state: RootState) => state);

  useEffect(() => {
    console.log("Redux State:", setupDetailsState);
    ApiConfig.getInstance().setEndpoint(setupDetailsState.node_address);
  }, [setupDetailsState]);
};