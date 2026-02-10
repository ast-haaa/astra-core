package com.astra.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    @GetMapping(value = "/alert", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> alertCall(@RequestParam String msg) {

        String xml = """
                <Response>
                    <Speak language="hi-IN" voice="female">
                        %s
                    </Speak>
                </Response>
                """.formatted(msg);

        return ResponseEntity.ok(xml);
    }
}
