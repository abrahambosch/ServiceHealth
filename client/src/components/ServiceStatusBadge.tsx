import '@rmwc/badge/styles';
import {ServiceStatus} from "../data/models";
import {Badge} from "@rmwc/badge";

interface ServiceStatusBadgeProps {
    status: ServiceStatus
}

export const ServiceStatusBadge = (props: ServiceStatusBadgeProps) => {
    switch (props.status) {
        case "ok":
            return <Badge align="inline" label={props.status} style={{ background: 'green', color: "#fff"}}/>;
        case "unknown":
            return <Badge align="inline" label="?" style={{ background: 'inherit' }}/>;
        default:
            return <Badge align="inline" label={props.status} style={{ background: 'red', color: "#fff" }}/>;
    }
}