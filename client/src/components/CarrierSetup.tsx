import React, {useState} from "react";
import {CarrierSetupRequest, CommandExecution} from "../data/models";
import {carrierSetup} from "../data/dataService";


interface carrierSetupProps {
    carrierSetupRequest: CarrierSetupRequest;
}

export const CarrierSetup = (props: carrierSetupProps) => {
    const [carrierSetupResponse, setCarrierSetupResponse] = useState<string>("");
    const onClickExecuteSetup = async () => {
        const response = await carrierSetup(props.carrierSetupRequest);
        setCarrierSetupResponse(JSON.stringify(response));
    }

    return <div>
        <h3>CarrierSetup</h3>
        <button onClick={onClickExecuteSetup}>Execute Setup</button>
        {carrierSetupResponse && <div style={{border: "1px solid #ccc", padding: "10px", margin: "15px"}}>{carrierSetupResponse}</div>}
    </div>;
}