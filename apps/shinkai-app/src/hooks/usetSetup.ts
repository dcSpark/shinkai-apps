// hooks/useSetup.ts
import { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store";
import { ApiConfig } from "@shinkai_network/shinkai-message-ts/api";

export const useSetup = () => {
  const setupDetails = useSelector(
    (state: RootState) => state.setupDetails,
    shallowEqual
  );

  useEffect(() => {
    console.log("Redux State:", setupDetails);
    ApiConfig.getInstance().setEndpoint(setupDetails.node_address);
  }, [setupDetails]);
};
