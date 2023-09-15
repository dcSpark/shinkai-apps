import { useParams } from "react-router-dom";

export const Inbox = () =>{
    const { inboxId } = useParams<{ inboxId: string }>();

    return (
        <span>Inbox:{decodeURIComponent(inboxId)}</span>
    );
}
