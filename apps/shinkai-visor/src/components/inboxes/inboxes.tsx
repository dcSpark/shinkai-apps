import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getAllInboxes } from "../../service-worker/store/inbox/inbox-actions";

export const Inboxes = () => {
    // const { data, status } = shinkaiApi.useGetInboxesQuery(undefined, { pollingInterval: 500 });

    // useEffect(() => {
    //     console.log('QUERY', data, status);
    // }, [data, status]);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAllInboxes());
    }, []);

    return (
        <h1>Inboxes</h1>
    );
};
