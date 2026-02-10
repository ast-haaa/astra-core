package com.astra.fabric;

import org.springframework.stereotype.Component;

import java.util.UUID;

/*
 FabricClient is a stub for early development.
 Replace with a real Hyperledger Fabric Java Gateway implementation later.
*/
@Component
public class FabricClient {

    public String submitAddEventHash(String batchId, String eventUuid, String dataHash, String role, String timestamp) {
        // Stub: return a fake txId so the backend can continue development and testing.
        return "tx-" + UUID.randomUUID().toString();
    }

    public String queryEventHash(String batchId, String eventUuid) {
        // Stub: in a real implementation this would call chaincode to fetch the stored hash.
        return null;
    }
}
