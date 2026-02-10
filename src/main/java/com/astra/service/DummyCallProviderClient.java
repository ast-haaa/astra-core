package com.astra.service;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class DummyCallProviderClient implements CallProviderClient {

    @Override
    public void makeCall(String phone, String message) {
        System.out.println("📞 DUMMY CALL → " + phone + " | msg=" + message);
    }
}
